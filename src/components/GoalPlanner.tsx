import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Target, TrendingUp, AlertTriangle, Plus, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

import SIPGrowthChart from "@/components/charts/SIPGrowthChart";
import InvestmentBreakdownChart from "@/components/charts/InvestmentBreakdownChart";

// Mock fund data for dropdown
const AVAILABLE_FUNDS = [
  { id: 1, name: "HDFC Top 100 Fund", cagr5y: 12.8, taxRate: 0.15, category: "Large Cap", riskLevel: "Moderate" },
  { id: 2, name: "Axis Bluechip Fund", cagr5y: 11.9, taxRate: 0.12, category: "Large Cap", riskLevel: "Moderate" },
  { id: 3, name: "SBI Small Cap Fund", cagr5y: 15.2, taxRate: 0.20, category: "Small Cap", riskLevel: "High" },
  { id: 4, name: "ICICI Prudential Technology Fund", cagr5y: 19.8, taxRate: 0.25, category: "Sectoral", riskLevel: "Very High" },
  { id: 5, name: "Mirae Asset Emerging Bluechip Fund", cagr5y: 14.3, taxRate: 0.18, category: "Mid Cap", riskLevel: "High" }
];

const GoalPlanner = () => {
  const location = useLocation();
  
  // Selected fund state with localStorage persistence
  const [selectedFund, setSelectedFund] = useState(() => {
    const savedState = localStorage.getItem('goalPlannerState');
    if (savedState) {
      const parsed = JSON.parse(savedState);
      return parsed.selectedFund || location.state?.selectedFund || null;
    }
    return location.state?.selectedFund || null;
  });
  
  // Chart view toggle
  const [chartViewMode, setChartViewMode] = useState("yearly");

  // Goal Creator state
  const [hasCreatedPlan, setHasCreatedPlan] = useState(() => {
    const savedState = localStorage.getItem('goalPlannerState');
    if (savedState) {
      return JSON.parse(savedState).hasCreatedPlan || false;
    }
    return false;
  });
  
  const [goalName, setGoalName] = useState(() => {
    const savedState = localStorage.getItem('goalPlannerState');
    if (savedState) {
      return JSON.parse(savedState).goalName || "";
    }
    return "";
  });

  // Results visibility state
  const [showResults, setShowResults] = useState(() => {
    const savedState = localStorage.getItem('goalPlannerState');
    if (savedState) {
      return JSON.parse(savedState).showResults || false;
    }
    return false;
  });

  // Goal Calculator state with localStorage persistence
  const [goalData, setGoalData] = useState(() => {
    const savedState = localStorage.getItem('goalPlannerState');
    if (savedState) {
      const parsed = JSON.parse(savedState);
      return parsed.goalData || {
        targetAmount: 1000000,
        timePeriod: 10,
        expectedReturn: selectedFund?.cagr5y || 12,
        sipFrequency: "monthly"
      };
    }
    return {
      targetAmount: 1000000,
      timePeriod: 10,
      expectedReturn: selectedFund?.cagr5y || 12,
      sipFrequency: "monthly"
    };
  });

  const [goalResults, setGoalResults] = useState({
    requiredSIP: 0,
    totalInvestment: 0,
    wealthGained: 0
  });

  // Progress tracking state (dummy data until backend)
  const [progressData, setProgressData] = useState({
    currentAmount: 0,
    monthsElapsed: 0,
    actualMonthlyInvestment: 0
  });

  // Tax-adjusted corpus states
  const [taxAdjustedData, setTaxAdjustedData] = useState({
    afterTaxCorpus: 0,
    taxPaid: 0
  });

  // Calculate required SIP for goal
  const calculateGoal = () => {
    const { targetAmount, timePeriod, expectedReturn } = goalData;
    const monthlyRate = expectedReturn / 100 / 12;
    const totalMonths = timePeriod * 12;
    
    // Required SIP formula: FV / [((1 + r)^n - 1) / r] * (1 + r)
    const requiredSIP = targetAmount / 
      (((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) * (1 + monthlyRate));
    
    const totalInvestment = requiredSIP * totalMonths;
    const wealthGained = targetAmount - totalInvestment;

    setGoalResults({
      requiredSIP: Math.round(requiredSIP),
      totalInvestment: Math.round(totalInvestment),
      wealthGained: Math.round(wealthGained)
    });
  };

  // Handle fund selection
  const handleFundSelection = (fundId: string) => {
    if (fundId === "none") {
      setSelectedFund(null);
      return;
    }
    
    const fund = AVAILABLE_FUNDS.find(f => f.id.toString() === fundId);
    if (fund) {
      setSelectedFund(fund);
      setGoalData(prev => ({ ...prev, expectedReturn: fund.cagr5y }));
    }
  };

  // Compute required investment when button is clicked
  const handleComputeInvestment = async () => {
    try {
      // Get token from localStorage (customize if you use context or other storage)
      const token = localStorage.getItem('token');
  const response = await fetch(`${import.meta.env.VITE_API_URL_PORTFOLIO}/api/v1/goal-plans/compute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          durationYears: goalData.timePeriod,
          expectedAnnualReturn: goalData.expectedReturn,
          targetAmount: goalData.targetAmount
        })
      });
      if (!response.ok) throw new Error('Failed to compute investment');
      const data = await response.json();
      setGoalResults({
        requiredSIP: Math.round(data.RequiredMonthlySIP),
        totalInvestment: Math.round(data.totalInvestment),
        wealthGained: Math.round(data.wealthGained)
      });
      setShowResults(true);
    } catch (error) {
      alert('Error computing required investment. Please try again.');
      console.error(error);
    }
  };

  // Save state to localStorage
  useEffect(() => {
    const state = {
      selectedFund,
      goalName,
      hasCreatedPlan,
      goalData,
      showResults
    };
    localStorage.setItem('goalPlannerState', JSON.stringify(state));
  }, [selectedFund, goalName, hasCreatedPlan, goalData, showResults]);

  // Fetch tax-adjusted data
  const fetchTaxAdjustedData = async () => {
    try {
      // TODO: Implement API call to get tax-adjusted data for saved plans
      // This will be used when saving/loading plans from backend
      
      // Fallback calculation using fund-specific tax rate
      const goalTaxRate = selectedFund?.taxRate || 0.2;
      
      setTaxAdjustedData({
        afterTaxCorpus: goalData.targetAmount * (1 - goalTaxRate),
        taxPaid: goalData.targetAmount * goalTaxRate
      });
    } catch (error) {
      console.error('Error fetching tax-adjusted data:', error);
      // Fallback calculation using fund-specific tax rate
      const taxRate = selectedFund?.taxRate || 0.2;
      setTaxAdjustedData({
        afterTaxCorpus: goalData.targetAmount * (1 - taxRate),
        taxPaid: goalData.targetAmount * taxRate
      });
    }
  };

  useEffect(() => {
    if (goalData.targetAmount > 0) {
      fetchTaxAdjustedData();
    }
  }, [goalData, selectedFund]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const createPlan = () => {
    if (!goalName.trim()) {
      alert('Please enter a goal name');
      return;
    }
    
    // TODO: Implement API call to save plan to backend
    // - POST to /api/plans with plan data
    // - Handle success/error responses
    // - Show toast notification
    
    const planData = {
      name: goalName,
      type: 'goal_planning',
      targetAmount: goalData.targetAmount,
      timePeriod: goalData.timePeriod,
      expectedReturn: goalData.expectedReturn,
      requiredSIP: goalResults.requiredSIP,
      selectedFund: selectedFund,
      createdAt: new Date().toISOString()
    };
    
    console.log('Creating plan:', planData);
    setHasCreatedPlan(true);
    
    // Initialize dummy progress data
    setProgressData({
      currentAmount: Math.random() * goalData.targetAmount * 0.3, // 0-30% progress
      monthsElapsed: Math.floor(Math.random() * goalData.timePeriod * 12 * 0.5), // 0-50% time elapsed
      actualMonthlyInvestment: goalResults.requiredSIP + (Math.random() - 0.5) * goalResults.requiredSIP * 0.1
    });
  };

  const createGoalPlan = async () => {
    if (!goalName || goalName.trim() === "") {
      alert("Goal name is required.");
      return;
    }
    try {
      const token = localStorage.getItem('token');
  const response = await fetch(`${import.meta.env.VITE_API_URL_PORTFOLIO}/api/v1/goal-plans/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: goalName,
          monthlySIPAmount: goalResults.requiredSIP,
          durationMonths: goalData.timePeriod * 12,
          targetAmount: goalData.targetAmount,
          expectedAnnualReturn: goalData.expectedReturn
        })
      });
      if (!response.ok) throw new Error('Failed to create goal plan');
      const data = await response.json();
      alert('Goal plan created successfully!');
      // Optionally, update state with returned plan data
      // setCreatedPlanData(data);
    } catch (error) {
      alert('Error creating goal plan. Please try again.');
      console.error(error);
    }
  };

  // Calculate shortfall for warning
  const shortfall = Math.max(0, goalData.targetAmount - taxAdjustedData.afterTaxCorpus);

  // Calculate progress percentage
  const progressPercentage = hasCreatedPlan ? (progressData.currentAmount / goalData.targetAmount) * 100 : 0;
  const timeProgressPercentage = hasCreatedPlan ? (progressData.monthsElapsed / (goalData.timePeriod * 12)) * 100 : 0;

  // Empty state when no plan is created
  if (!hasCreatedPlan) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Target className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Goal Planner</h1>
              <p className="text-muted-foreground">Create and track your financial goals</p>
            </div>
          </div>
        </div>

        {/* Empty State */}
        <Card className="shadow-soft">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Target className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Start Planning Your Financial Goals</h3>
            <p className="text-muted-foreground text-center mb-8 max-w-md">
              Create a financial goal plan to track your progress and stay motivated on your investment journey.
            </p>
            <Button onClick={() => setHasCreatedPlan(true)} size="lg" className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Create Your First Goal
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Target className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Goal Planner</h1>
            <p className="text-muted-foreground">Track and manage your financial goals</p>
          </div>
        </div>
      </div>

      {/* Goal Configuration and Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatePresence mode="wait">
          <motion.div
            key="calculator"
            initial={{ x: 0, width: "100%" }}
            animate={{ 
              x: showResults ? 0 : 0, 
              width: showResults ? "100%" : "100%" 
            }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className={showResults ? "lg:col-span-1" : "lg:col-span-2"}
          >
            {/* Goal Configuration Form */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Goal Configuration
          </CardTitle>
          <CardDescription>
            Configure your financial goal parameters
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="goalName">Goal Name</Label>
            <Input
              id="goalName"
              type="text"
              value={goalName}
              onChange={(e) => setGoalName(e.target.value)}
              placeholder="e.g., Dream Home, Retirement Fund"
              className="text-lg font-medium"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetAmount">Target Amount</Label>
            <Input
              id="targetAmount"
              type="number"
              value={goalData.targetAmount}
              onChange={(e) => setGoalData(prev => ({ ...prev, targetAmount: Number(e.target.value) }))}
              className="text-lg font-medium"
            />
            <p className="text-sm text-muted-foreground">
              Goal: {formatCurrency(goalData.targetAmount)}
            </p>
          </div>

          <div className="space-y-4">
            <Label>Time Period: {goalData.timePeriod} years</Label>
            <Slider
              value={[goalData.timePeriod]}
              onValueChange={(value) => setGoalData(prev => ({ ...prev, timePeriod: value[0] }))}
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
            <Label>
              Expected Annual Return: {goalData.expectedReturn}%
              {selectedFund && <span className="text-sm text-muted-foreground ml-2">(from {selectedFund.name})</span>}
            </Label>
            <Slider
              value={[goalData.expectedReturn]}
              onValueChange={(value) => setGoalData(prev => ({ ...prev, expectedReturn: value[0] }))}
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
            onClick={handleComputeInvestment}
            className="w-full"
            size="lg"
          >
            Compute Required Investment
          </Button>
        </CardContent>
      </Card>
          </motion.div>
        </AnimatePresence>

        <AnimatePresence>
          {showResults && (
            <motion.div
              key="results"
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="lg:col-span-1"
            >

              {/* Required Investment Results */}
              <Card className="shadow-soft h-fit">
                <CardHeader>
                  <CardTitle>Required Investment</CardTitle>
                  <CardDescription>Monthly SIP needed to reach your goal</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Required Monthly SIP</p>
                        <p className="text-2xl font-bold text-primary">{formatCurrency(goalResults.requiredSIP)}</p>
                      </div>
                      <Target className="h-8 w-8 text-primary" />
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="p-4 rounded-lg bg-muted/30">
                        <p className="text-sm font-medium text-muted-foreground">Total Investment</p>
                        <p className="text-lg font-bold">{formatCurrency(goalResults.totalInvestment)}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-success/10">
                        <p className="text-sm font-medium text-muted-foreground">Wealth Gained</p>
                        <p className="text-lg font-bold text-success">{formatCurrency(goalResults.wealthGained)}</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
                      <p className="text-sm text-muted-foreground">Achievement Rate</p>
                      <p className="text-xl font-bold text-primary">
                        {goalResults.totalInvestment > 0 ? 
                          ((goalData.targetAmount / goalResults.totalInvestment) * 100).toFixed(1) : 0}%
                      </p>
                    </div>

                    <Button 
                      onClick={createGoalPlan}
                      className="w-full"
                      size="lg"
                    >
                      Create Goal Plan
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GoalPlanner;