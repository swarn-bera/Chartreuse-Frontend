import { useState } from "react";
import { Search, Filter, Plus, Building2, TrendingUp, Calendar, Info } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface CreatePortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToPortfolio: (fund: any, invested: number, units: number) => void;
}

const CreatePortfolioModal = ({ isOpen, onClose, onAddToPortfolio }: CreatePortfolioModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedFund, setSelectedFund] = useState<any>(null);
  const [invested, setInvested] = useState("");
  const [units, setUnits] = useState("");

  // TODO: Replace with API call to fetch mutual funds
  const mockFunds = [
    {
      id: 1,
      name: "HDFC Top 100 Fund - Direct Plan - Growth",
      nav: 856.42,
      navDate: "2024-01-15",
      category: "Large Cap",
      description: "Invests primarily in top 100 companies by market capitalization",
      rating: 4,
      returns: {
        "1Y": "18.5%",
        "3Y": "16.2%",
        "5Y": "14.8%"
      }
    },
    {
      id: 2,
      name: "Axis Bluechip Fund - Direct Plan - Growth",
      nav: 67.84,
      navDate: "2024-01-15",
      category: "Large Cap",
      description: "Focuses on blue-chip companies with strong fundamentals",
      rating: 5,
      returns: {
        "1Y": "16.2%",
        "3Y": "15.8%",
        "5Y": "13.9%"
      }
    },
    {
      id: 3,
      name: "SBI Small Cap Fund - Direct Plan - Growth",
      nav: 128.94,
      navDate: "2024-01-15",
      category: "Small Cap",
      description: "Invests in small-cap companies with high growth potential",
      rating: 4,
      returns: {
        "1Y": "22.8%",
        "3Y": "18.4%",
        "5Y": "16.2%"
      }
    },
    {
      id: 4,
      name: "Mirae Asset Emerging Bluechip - Direct - Growth",
      nav: 89.45,
      navDate: "2024-01-15",
      category: "Large & Mid Cap",
      description: "Invests across large and mid-cap stocks for balanced growth",
      rating: 5,
      returns: {
        "1Y": "20.1%",
        "3Y": "17.6%",
        "5Y": "15.3%"
      }
    },
    {
      id: 5,
      name: "Parag Parikh Flexi Cap Fund - Direct - Growth",
      nav: 78.32,
      navDate: "2024-01-15",
      category: "Flexi Cap",
      description: "Flexible approach across market capitalizations and geographies",
      rating: 4,
      returns: {
        "1Y": "19.3%",
        "3Y": "16.9%",
        "5Y": "14.7%"
      }
    }
  ];

  const categories = ["all", "Large Cap", "Mid Cap", "Small Cap", "Large & Mid Cap", "Flexi Cap", "Multi Cap"];

  const filteredFunds = mockFunds.filter(fund => {
    const matchesSearch = fund.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || fund.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount);
  };

  const handleAddToPortfolio = () => {
    if (selectedFund && invested && units) {
      onAddToPortfolio(selectedFund, parseFloat(invested), parseFloat(units));
      setSelectedFund(null);
      setInvested("");
      setUnits("");
    }
  };

  if (selectedFund) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add {selectedFund.name} to Portfolio</DialogTitle>
            <DialogDescription>
              Enter your investment details for this fund
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Fund Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{selectedFund.name}</CardTitle>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    <span>NAV: {formatCurrency(selectedFund.nav)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{selectedFund.navDate}</span>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Investment Form */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="invested">Amount Invested (₹)</Label>
                <Input
                  id="invested"
                  type="number"
                  placeholder="Enter amount invested"
                  value={invested}
                  onChange={(e) => setInvested(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="units">Units Purchased</Label>
                <Input
                  id="units"
                  type="number"
                  placeholder="Enter units purchased"
                  value={units}
                  onChange={(e) => setUnits(e.target.value)}
                />
              </div>
            </div>

            {/* Calculated Values */}
            {invested && units && (
              <Card className="bg-muted/50">
                <CardContent className="pt-6">
                  <div className="grid gap-4 md:grid-cols-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Current Value</p>
                      <p className="font-medium">{formatCurrency(selectedFund.nav * parseFloat(units))}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Profit/Loss</p>
                      <p className={`font-medium ${
                        (selectedFund.nav * parseFloat(units)) - parseFloat(invested) >= 0 
                          ? 'text-success' 
                          : 'text-destructive'
                      }`}>
                        {formatCurrency((selectedFund.nav * parseFloat(units)) - parseFloat(invested))}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Returns %</p>
                      <p className={`font-medium ${
                        (selectedFund.nav * parseFloat(units)) - parseFloat(invested) >= 0 
                          ? 'text-success' 
                          : 'text-destructive'
                      }`}>
                        {(((selectedFund.nav * parseFloat(units)) - parseFloat(invested)) / parseFloat(invested) * 100).toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setSelectedFund(null)}>
                Back to Fund List
              </Button>
              <Button 
                onClick={handleAddToPortfolio}
                disabled={!invested || !units}
                className="bg-gradient-primary hover:opacity-90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add to Portfolio
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Build Your Portfolio</DialogTitle>
          <DialogDescription>
            Search and select mutual funds to add to your portfolio
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search and Filter */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search funds by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.filter(cat => cat !== "all").map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Fund Cards */}
          <div className="grid gap-4">
            {filteredFunds.map(fund => (
              <Card key={fund.id} className="hover:shadow-medium transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-medium">{fund.name}</CardTitle>
                      <CardDescription className="mt-1">{fund.description}</CardDescription>
                      <div className="flex items-center gap-4 mt-3">
                        <Badge variant="outline">{fund.category}</Badge>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Building2 className="h-4 w-4" />
                          <span>NAV: {formatCurrency(fund.nav)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>{fund.navDate}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="grid grid-cols-3 gap-2 text-sm mb-3">
                        <div>
                          <p className="text-muted-foreground">1Y</p>
                          <p className="font-medium text-success">{fund.returns["1Y"]}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">3Y</p>
                          <p className="font-medium text-success">{fund.returns["3Y"]}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">5Y</p>
                          <p className="font-medium text-success">{fund.returns["5Y"]}</p>
                        </div>
                      </div>
                      <Button 
                        size="sm"
                        onClick={() => setSelectedFund(fund)}
                        className="bg-gradient-primary hover:opacity-90"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add to Portfolio
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>

          {filteredFunds.length === 0 && (
            <div className="text-center py-8">
              <Info className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No funds found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search criteria or category filter
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePortfolioModal;