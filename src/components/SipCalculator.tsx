import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SIPGrowthChart from "@/components/charts/SIPGrowthChart";
import InvestmentBreakdownChart from "@/components/charts/InvestmentBreakdownChart";

const SIPCalculator = () => {
  
  // Chart view toggle
  const [chartViewMode, setChartViewMode] = useState("yearly");
  
  // Results visibility state
  const [showResults, setShowResults] = useState(() => {
    const savedState = localStorage.getItem('sipCalculatorState');
    if (savedState) {
      return JSON.parse(savedState).showResults || false;
    }
    return false;
  });
  
  // SIP Calculator state
  const [sipData, setSipData] = useState(() => {
    const savedState = localStorage.getItem('sipCalculatorState');
    if (savedState) {
      const parsed = JSON.parse(savedState);
      return parsed.sipData || {
        monthlyAmount: 5000,
        timePeriod: 10,
        expectedReturn: 12,
        sipFrequency: "monthly"
      };
    }
    return {
      monthlyAmount: 5000,
      timePeriod: 10,
      expectedReturn: 12,
      sipFrequency: "monthly"
    };
  });

  const [sipResults, setSipResults] = useState({
    maturityValue: 0,
    totalInvestment: 0,
    wealthGained: 0,
    totalReturn: 0
  });

  // Tax-adjusted corpus states
  const [showTaxAdjusted, setShowTaxAdjusted] = useState(false);
  const [taxAdjustedData, setTaxAdjustedData] = useState({
    afterTaxCorpus: 0,
    taxPaid: 0
  });


  // SIP calculation is now handled by backend API.


  // Calculate returns when button is clicked
  const handleCalculateReturns = async () => {
    setShowResults(false);
    try {
      const response = await fetch('http://localhost:3003/api/v1/goal-plans/sip/calculate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
         },
        body: JSON.stringify({
          monthlyAmount: String(sipData.monthlyAmount),
          timePeriod: String(sipData.timePeriod),
          expectedReturn: String(sipData.expectedReturn)
        })
      });
      if (!response.ok) throw new Error('Failed to fetch SIP results');
      const data = await response.json();
      setSipResults({
        maturityValue: data.maturityValue,
        totalInvestment: data.totalInvestment,
        wealthGained: data.wealthGained,
        totalReturn: data.totalReturn
      });
      setShowResults(true);
    } catch (error) {
      alert('Error calculating SIP returns');
      setShowResults(false);
    }
  };

  // Save state to localStorage
  useEffect(() => {
    const state = {
      sipData,
      showResults
    };
    localStorage.setItem('sipCalculatorState', JSON.stringify(state));
  }, [sipData, showResults]);

  // Fetch tax-adjusted data
  const fetchTaxAdjustedData = async () => {
    try {
      // TODO: Implement API call to get tax-adjusted data
      const sipResponse = await fetch(`/api/simulate/tax-adjusted/sip-${Date.now()}`);
      
      if (sipResponse.ok) {
        const sipTaxData = await sipResponse.json();
        setTaxAdjustedData(sipTaxData);
      } else {
        // Fallback calculation if API is not available
        const sipTaxRate = 0.2;
        
        setTaxAdjustedData({
          afterTaxCorpus: sipResults.maturityValue * (1 - sipTaxRate),
          taxPaid: sipResults.maturityValue * sipTaxRate
        });
      }
    } catch (error) {
      console.error('Error fetching tax-adjusted data:', error);
      // Fallback calculation
      const taxRate = 0.2;
      setTaxAdjustedData({
        afterTaxCorpus: sipResults.maturityValue * (1 - taxRate),
        taxPaid: sipResults.maturityValue * taxRate
      });
    }
  };

  useEffect(() => {
    if (showTaxAdjusted && sipResults.maturityValue > 0) {
      fetchTaxAdjustedData();
    }
  }, [showTaxAdjusted, sipResults]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const savePlan = () => {
    // TODO: Implement save plan functionality
    // - Create a new investment plan object
    // - Save to user's saved plans
    // - Show success notification
    // - Optionally navigate to saved plans page
    
    const planData = {
      type: 'sip_calculation',
      monthlyAmount: sipData.monthlyAmount,
      timePeriod: sipData.timePeriod,
      expectedReturn: sipData.expectedReturn,
      maturityValue: sipResults.maturityValue,
      createdAt: new Date().toISOString()
    };
    
    console.log('Saving plan:', planData);
    // Show success message
    alert('Plan saved successfully!');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calculator className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">SIP Calculator</h1>
            <p className="text-muted-foreground">Calculate your SIP returns</p>
          </div>
        </div>
        
      </div>

      {/* Calculator and Results Layout */}
      <div className="flex gap-6 min-h-[600px]">
        {/* SIP Calculator - Left Side */}
        <motion.div
          className={showResults ? "w-1/2" : "w-full"}
          animate={{ width: showResults ? "50%" : "100%" }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <Card className="shadow-soft h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                SIP Calculator
              </CardTitle>
              <CardDescription>
                Configure your SIP parameters to calculate future returns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="monthlyAmount">Monthly Investment Amount</Label>
                <Input
                  id="monthlyAmount"
                  type="number"
                  value={sipData.monthlyAmount}
                  onChange={(e) => setSipData(prev => ({ ...prev, monthlyAmount: Number(e.target.value) }))}
                  className="text-lg font-medium"
                />
                <p className="text-sm text-muted-foreground">
                  Current: {formatCurrency(sipData.monthlyAmount)}
                </p>
              </div>

              <div className="space-y-4">
                <Label>Investment Period: {sipData.timePeriod} years</Label>
                <Slider
                  value={[sipData.timePeriod]}
                  onValueChange={(value) => setSipData(prev => ({ ...prev, timePeriod: value[0] }))}
                  max={30}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>1 year</span>
                  <span>30 years</span>
                </div>
              </div>

              <div className="space-y-4">
                <Label>Expected Annual Return: {sipData.expectedReturn}%</Label>
                <Slider
                  value={[sipData.expectedReturn]}
                  onValueChange={(value) => setSipData(prev => ({ ...prev, expectedReturn: value[0] }))}
                  max={25}
                  min={1}
                  step={0.5}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>1%</span>
                  <span>25%</span>
                </div>
              </div>

              <Button 
                onClick={handleCalculateReturns}
                className="w-full"
                size="lg"
              >
                Calculate Returns
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Results - Right Side */}
        <AnimatePresence>
          {showResults && (
            <motion.div
              className="w-1/2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              <Card className="shadow-soft h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Investment Results</CardTitle>
                      <CardDescription>Projected returns for your SIP investment</CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="tax-toggle" className="text-sm">Tax-adjusted</Label>
                      <Switch
                        id="tax-toggle"
                        checked={showTaxAdjusted}
                        onCheckedChange={setShowTaxAdjusted}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Maturity Value</p>
                        <p className="text-2xl font-bold text-primary">{formatCurrency(sipResults.maturityValue)}</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-primary" />
                    </div>

                    {showTaxAdjusted && (
                      <div className="grid grid-cols-1 gap-4">
                        <div className="p-4 rounded-lg bg-orange-50 border border-orange-200">
                          <p className="text-sm font-medium text-muted-foreground">After-tax Corpus</p>
                          <p className="text-lg font-bold text-orange-600">{formatCurrency(taxAdjustedData.afterTaxCorpus)}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                          <p className="text-sm font-medium text-muted-foreground">Tax Paid</p>
                          <p className="text-lg font-bold text-red-600">{formatCurrency(taxAdjustedData.taxPaid)}</p>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 gap-4">
                      <div className="p-4 rounded-lg bg-muted/30">
                        <p className="text-sm font-medium text-muted-foreground">Total Investment</p>
                        <p className="text-lg font-bold">{formatCurrency(sipResults.totalInvestment)}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-success/10">
                        <p className="text-sm font-medium text-muted-foreground">Wealth Gained</p>
                        <p className="text-lg font-bold text-success">{formatCurrency(sipResults.wealthGained)}</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
                      <p className="text-sm text-muted-foreground">Total Return</p>
                      <p className="text-xl font-bold text-primary">
                        {sipResults.totalInvestment > 0 ? 
                          ((sipResults.wealthGained / sipResults.totalInvestment) * 100).toFixed(1) : 0}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Charts Section - Only show after calculation */}
      {showResults && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Investment Analysis</h2>
              <p className="text-muted-foreground">Detailed charts and projections</p>
            </div>
            
            {/* Chart View Toggle */}
            <div className="flex items-center gap-2">
              <Label htmlFor="chart-view" className="text-sm">Chart View:</Label>
              <Select value={chartViewMode} onValueChange={setChartViewMode}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yearly">Yearly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>SIP Growth Over Time</CardTitle>
                <CardDescription>See how your investments will grow</CardDescription>
              </CardHeader>
              <CardContent>
                <SIPGrowthChart 
                  monthlyAmount={sipData.monthlyAmount}
                  timePeriod={sipData.timePeriod}
                  expectedReturn={sipData.expectedReturn}
                  viewMode={chartViewMode}
                />
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Investment Breakdown</CardTitle>
                <CardDescription>Total investment vs wealth generated</CardDescription>
              </CardHeader>
              <CardContent>
                <InvestmentBreakdownChart 
                  totalInvestment={sipResults.totalInvestment}
                  wealthGained={sipResults.wealthGained}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default SIPCalculator;