import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart as PieChartIcon } from "lucide-react";

interface InvestmentBreakdownChartProps {
  totalInvestment: number;
  wealthGained: number;
}

const InvestmentBreakdownChart = ({ totalInvestment, wealthGained }: InvestmentBreakdownChartProps) => {
  // TODO: Replace with dynamic data from actual portfolio
  // - Include different investment categories (equity, debt, hybrid)
  // - Add expense ratios and tax implications
  // - Show sector-wise allocation breakdown
  
  const chartData = [
    {
      name: "Total Investment",
      value: totalInvestment,
      color: "hsl(217, 91%, 60%)", // Modern blue
      percentage: totalInvestment > 0 ? (totalInvestment / (totalInvestment + wealthGained)) * 100 : 0
    },
    {
      name: "Wealth Gained",
      value: wealthGained,
      color: "hsl(142, 71%, 45%)", // Modern green
      percentage: totalInvestment > 0 ? (wealthGained / (totalInvestment + wealthGained)) * 100 : 0
    },
  ];

  const chartConfig = {
    investment: {
      label: "Total Investment",
      color: "hsl(217, 91%, 60%)", // Modern blue
    },
    gains: {
      label: "Wealth Gained", 
      color: "hsl(142, 71%, 45%)", // Modern green
    },
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value, percentage }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percentage < 5) return null; // Don't show label for very small slices

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-lg font-bold drop-shadow-lg"
      >
        {`${percentage.toFixed(1)}%`}
      </text>
    );
  };

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChartIcon className="h-5 w-5 text-primary" />
          Investment Breakdown
        </CardTitle>
        <CardDescription>
          Distribution of your investment vs returns
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={CustomLabel}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => [
                      formatCurrency(Number(value)),
                      name
                    ]}
                  />
                }
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value, entry: any) => (
                  <span className="text-base font-semibold">
                    {value}: {formatCurrency(entry.payload.value)} ({entry.payload.percentage.toFixed(1)}%)
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
        
        {/* Summary Stats */}
        <div className="mt-4 grid grid-cols-2 gap-4 border-t pt-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Total Investment</p>
            <p className="text-lg font-bold">{formatCurrency(totalInvestment)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Wealth Gained</p>
            <p className="text-lg font-bold text-success">{formatCurrency(wealthGained)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InvestmentBreakdownChart;