import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

interface SIPGrowthChartProps {
  monthlyAmount: number;
  timePeriod: number;
  expectedReturn: number;
  viewMode?: string;
}

const SIPGrowthChart = ({ monthlyAmount, timePeriod, expectedReturn, viewMode = "yearly" }: SIPGrowthChartProps) => {
  // TODO: Replace with dynamic data from real SIP calculations
  // - Calculate actual month-wise growth based on SIP parameters
  // - Include market volatility and realistic growth patterns
  // - Add different scenarios (optimistic, pessimistic, realistic)
  
  // Generate dummy data for SIP growth over time
  const generateSIPData = () => {
    const data = [];
    const monthlyRate = expectedReturn / 100 / 12;
    let totalInvestment = 0;
    let currentValue = 0;
    
    // Generate monthly data internally, then filter for display based on view mode
    for (let month = 0; month <= timePeriod * 12; month++) {
      if (month > 0) {
        totalInvestment += monthlyAmount;
        // Add monthly investment and apply return on existing value
        currentValue = (currentValue * (1 + monthlyRate)) + monthlyAmount;
      }
      
      // Determine if we should include this data point based on view mode
      const shouldInclude = viewMode === "monthly" 
        ? true // Include all months for monthly view
        : (month % 12 === 0); // Only include yearly points for yearly view
      
      if (shouldInclude) {
        const label = viewMode === "monthly"
          ? (month === 0 ? "0" : `${month}`)
          : (month === 0 ? "0" : `${Math.floor(month / 12)}`);
          
        data.push({
          year: label,
          investment: totalInvestment,
          value: Math.round(currentValue),
          yearNumber: viewMode === "monthly" ? month : Math.floor(month / 12)
        });
      }
    }
    
    return data;
  };

  const chartData = generateSIPData();
  
  const chartConfig = {
    investment: {
      label: "Total Investment",
      color: "hsl(217, 91%, 60%)", // Modern blue
    },
    value: {
      label: "Portfolio Value", 
      color: "hsl(142, 71%, 45%)", // Modern green
    },
  };

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          SIP Growth Over Time
        </CardTitle>
        <CardDescription>
          Track your investment growth trajectory over {timePeriod} years ({viewMode} view)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="year" 
                className="text-xs"
                interval={viewMode === "monthly" ? "preserveStartEnd" : 0}
                angle={viewMode === "monthly" ? -45 : 0}
                textAnchor={viewMode === "monthly" ? "end" : "middle"}
                height={viewMode === "monthly" ? 60 : 30}
              />
              <YAxis 
                className="text-xs"
                tickFormatter={(value) => `₹${(value / 100000).toFixed(1)}L`}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    hideLabel={true}
                    formatter={(value, name) => [
                      `₹${Number(value).toLocaleString('en-IN')}`,
                      name === 'investment' ? ' Total Investment' : ' Portfolio Value'
                    ]}
                  />
                }
              />
              <Line
                type="monotone"
                dataKey="investment"
                stroke="var(--color-investment)"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="var(--color-value)"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            {viewMode === "monthly" ? "Months" : "Years"} →
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SIPGrowthChart;