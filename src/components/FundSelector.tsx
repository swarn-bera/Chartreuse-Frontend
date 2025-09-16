import { useState } from "react";
import { BarChart3, Search, Filter } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Mock fund data for dropdown
const AVAILABLE_FUNDS = [
  { id: 1, name: "HDFC Top 100 Fund", cagr5y: 12.8, taxRate: 0.15, category: "Large Cap", riskLevel: "Moderate" },
  { id: 2, name: "Axis Bluechip Fund", cagr5y: 11.9, taxRate: 0.12, category: "Large Cap", riskLevel: "Moderate" },
  { id: 3, name: "SBI Small Cap Fund", cagr5y: 15.2, taxRate: 0.20, category: "Small Cap", riskLevel: "High" },
  { id: 4, name: "ICICI Prudential Technology Fund", cagr5y: 19.8, taxRate: 0.25, category: "Sectoral", riskLevel: "Very High" },
  { id: 5, name: "Mirae Asset Emerging Bluechip Fund", cagr5y: 14.3, taxRate: 0.18, category: "Mid Cap", riskLevel: "High" },
  { id: 6, name: "Parag Parikh Flexi Cap Fund", cagr5y: 13.5, taxRate: 0.16, category: "Flexi Cap", riskLevel: "Moderate" },
  { id: 7, name: "Kotak Multi Cap Fund", cagr5y: 11.2, taxRate: 0.14, category: "Multi Cap", riskLevel: "Moderate" }
];

const CATEGORIES = ["All", "Large Cap", "Mid Cap", "Small Cap", "Flexi Cap", "Multi Cap", "Sectoral"];

interface FundSelectorProps {
  selectedFund: any;
  onFundSelection: (fundId: string) => void;
}

const FundSelector = ({ selectedFund, onFundSelection }: FundSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Filter funds based on search and category
  const filteredFunds = AVAILABLE_FUNDS.filter(fund => {
    const matchesSearch = fund.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "All" || fund.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    // TODO: Implement API call for dynamic fund search
    // const response = await fetch(`/api/funds/search?query=${query}`);
  };

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Fund Selector
        </CardTitle>
        <CardDescription>
          {selectedFund 
            ? `Currently selected: ${selectedFund.name} (${selectedFund.category})`
            : "No fund selected - using manual inputs"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Search and Filter */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fund-search">Search Funds</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="fund-search"
                  type="text"
                  placeholder="Search fund name..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category-filter">Filter by Category</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Fund Selection */}
          <div className="space-y-2">
            <Label htmlFor="fund-select">Select Mutual Fund (Optional)</Label>
            <Select 
              value={selectedFund?.id.toString() || "none"} 
              onValueChange={onFundSelection}
            >
              <SelectTrigger>
                <SelectValue placeholder="No fund selected" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No fund selected</SelectItem>
                {filteredFunds.map((fund) => (
                  <SelectItem key={fund.id} value={fund.id.toString()}>
                    {fund.name} - {fund.cagr5y}% (5Y CAGR)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {filteredFunds.length === 0 && searchQuery && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No funds found matching "{searchQuery}" in {categoryFilter !== "All" ? categoryFilter : "all categories"}
            </p>
          )}
          
          {selectedFund && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Category</Label>
                <p className="text-sm font-medium">{selectedFund.category}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Risk Level</Label>
                <p className="text-sm font-medium">{selectedFund.riskLevel}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">5Y CAGR</Label>
                <p className="text-sm font-medium">{selectedFund.cagr5y}%</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Tax Rate</Label>
                <p className="text-sm font-medium">{(selectedFund.taxRate * 100).toFixed(0)}%</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FundSelector;