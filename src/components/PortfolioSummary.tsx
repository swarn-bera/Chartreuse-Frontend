import { TrendingUp, TrendingDown, DollarSign, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PortfolioSummaryProps {
  holdings: any[];
}

const PortfolioSummary = ({ holdings }: PortfolioSummaryProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount);
  };

  const totalInvestment = holdings.reduce((sum, holding) => sum + holding.invested, 0);
  const totalCorpus = holdings.reduce((sum, holding) => sum + holding.currentValue, 0);
  const totalReturns = totalCorpus - totalInvestment;
  const absolutePercentage = totalInvestment > 0 ? (totalReturns / totalInvestment * 100) : 0;

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card className="shadow-soft">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">TOTAL INVESTMENT</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalInvestment)}</div>
          <p className="text-xs text-muted-foreground">
            Principal amount invested
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">TOTAL CORPUS</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalCorpus)}</div>
          <p className="text-xs text-muted-foreground">
            Current portfolio value
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">RETURNS</CardTitle>
          {totalReturns >= 0 ? (
            <TrendingUp className="h-4 w-4 text-success" />
          ) : (
            <TrendingDown className="h-4 w-4 text-destructive" />
          )}
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${totalReturns >= 0 ? 'text-success' : 'text-destructive'}`}>
            {formatCurrency(totalReturns)}
          </div>
          <p className={`text-xs ${totalReturns >= 0 ? 'text-success' : 'text-destructive'}`}>
            {totalReturns >= 0 ? 'Profit' : 'Loss'} on investments
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">ABSOLUTE %</CardTitle>
          {absolutePercentage >= 0 ? (
            <TrendingUp className="h-4 w-4 text-success" />
          ) : (
            <TrendingDown className="h-4 w-4 text-destructive" />
          )}
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${absolutePercentage >= 0 ? 'text-success' : 'text-destructive'}`}>
            {absolutePercentage.toFixed(3)}%
          </div>
          <p className={`text-xs ${absolutePercentage >= 0 ? 'text-success' : 'text-destructive'}`}>
            Overall portfolio returns
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PortfolioSummary;