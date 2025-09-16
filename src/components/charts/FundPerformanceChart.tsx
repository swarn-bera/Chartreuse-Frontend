import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

const FundPerformanceChart = () => {
  // TODO: Replace with dynamic data from real fund performance API
  // - Fetch actual CAGR data for funds from market data provider
  // - Include benchmark comparison (Nifty 50, Sensex)
  // - Add different time periods (1Y, 3Y, 5Y comparison)
  // - Include risk-adjusted returns (Sharpe ratio)
  
  const chartData = [
    {
      name: "HDFC Top 100",
      cagr1y: 18.5,
      cagr3y: 15.2,
      cagr5y: 12.8,
      category: "Large Cap",
      riskLevel: "Moderate"
    },
    {
      name: "Axis Bluechip",
      cagr1y: 16.2,
      cagr3y: 14.1,
      cagr5y: 11.9,
      category: "Large Cap",
      riskLevel: "Moderate"
    },
    {
      name: "SBI Small Cap",
      cagr1y: 22.8,
      cagr3y: 18.5,
      cagr5y: 15.2,
      category: "Small Cap",
      riskLevel: "High"
    },
  ];

  const chartConfig = {
    cagr1y: {
      label: "1 Year CAGR",
      color: "hsl(var(--chart-1))",
    },
    cagr3y: {
      label: "3 Year CAGR",
      color: "hsl(var(--chart-2))",
    },
    cagr5y: {
      label: "5 Year CAGR",
      color: "hsl(var(--chart-3))",
    },
  };

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Fund Performance Comparison
        </CardTitle>
        <CardDescription>
          CAGR (%) comparison across different time periods
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="name" 
                className="text-xs"
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                className="text-xs"
                tickFormatter={(value) => `${value}%`}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => [
                      `${Number(value).toFixed(1)}%`,
                      name === 'cagr1y' ? '1 Year CAGR' : 
                      name === 'cagr3y' ? '3 Year CAGR' : '5 Year CAGR'
                    ]}
                    labelFormatter={(label) => `Fund: ${label}`}
                  />
                }
              />
              <Bar
                dataKey="cagr1y"
                fill="var(--color-cagr1y)"
                name="1Y CAGR"
                radius={[2, 2, 0, 0]}
              />
              <Bar
                dataKey="cagr3y"
                fill="var(--color-cagr3y)"
                name="3Y CAGR"
                radius={[2, 2, 0, 0]}
              />
              <Bar
                dataKey="cagr5y"
                fill="var(--color-cagr5y)"
                name="5Y CAGR"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
        
        {/* Performance Summary */}
        <div className="mt-4 grid grid-cols-3 gap-4 border-t pt-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Best 1Y</p>
            <p className="text-lg font-bold text-success">
              {Math.max(...chartData.map(d => d.cagr1y)).toFixed(1)}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Best 3Y</p>
            <p className="text-lg font-bold text-success">
              {Math.max(...chartData.map(d => d.cagr3y)).toFixed(1)}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Best 5Y</p>
            <p className="text-lg font-bold text-success">
              {Math.max(...chartData.map(d => d.cagr5y)).toFixed(1)}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FundPerformanceChart;