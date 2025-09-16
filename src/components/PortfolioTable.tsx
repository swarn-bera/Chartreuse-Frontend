import { useState } from "react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from "@/components/ui/alert-dialog";
import { Search, ArrowUpDown, Edit, Trash2, Plus, IndianRupee } from "lucide-react";
import SipTransactionModal from "./SipTransactionModal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useSidebar } from "@/components/ui/sidebar";

interface PortfolioTableProps {
  holdings: any[];
  onRemoveHolding: (id: string) => void;
  onAddMoreFunds: () => void;
  onSipClick?: (fundId: string, fundName: string) => void;
}

const PortfolioTable = ({ holdings, onRemoveHolding, onAddMoreFunds, onSipClick }: PortfolioTableProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "" });
  const [sipModalOpen, setSipModalOpen] = useState(false);
  const [selectedFund, setSelectedFund] = useState<{ id: string; name: string } | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const { open: sidebarOpen } = useSidebar();

  const handleSipClick = (fundId: string, fundName: string) => {
    if (onSipClick) {
      onSipClick(fundId, fundName);
    } else {
      setSelectedFund({ id: fundId, name: fundName });
      setSipModalOpen(true);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount);
  };

  const handleSort = (key: string) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSortedHoldings = holdings
    .filter(holding => 
      holding.fundName.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (!sortConfig.key) return 0;
      
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (typeof aValue === "string") {
        return sortConfig.direction === "asc" 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      return sortConfig.direction === "asc" 
        ? aValue - bValue 
        : bValue - aValue;
    });

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Portfolio Holdings</CardTitle>
            <CardDescription>Track your mutual fund investments and performance</CardDescription>
          </div>
          <Button 
            onClick={onAddMoreFunds}
            className="bg-gradient-primary hover:opacity-90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add More Funds
          </Button>
        </div>
        
        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search funds..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort("fundName")}
                >
                  <div className="flex items-center gap-2">
                    Name
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>Type</TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort("currentNAV")}
                >
                  <div className="flex items-center gap-2">
                    Current NAV
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>NAV Date</TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort("invested")}
                >
                  <div className="flex items-center gap-2">
                    Invested
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort("units")}
                >
                  <div className="flex items-center gap-2">
                    Units
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort("currentValue")}
                >
                  <div className="flex items-center gap-2">
                    Current Value
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort("profitLoss")}
                >
                  <div className="flex items-center gap-2">
                    Profit/Loss
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className={sidebarOpen ? "hidden" : "table-cell"}>
                  <div className="flex items-center gap-2">
                    Absolute Returns %
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className={sidebarOpen ? "hidden" : "table-cell"}>
                  <div className="flex items-center gap-2">
                    Day's Change
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className={sidebarOpen ? "hidden" : "table-cell"}>
                  <div className="flex items-center gap-2">
                    Day's Change %
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedHoldings.map((holding, index) => (
                <TableRow 
                  key={holding.id}
                  className={index % 2 === 0 ? "bg-muted/20" : ""}
                >
                  <TableCell className="font-medium">
                    <div className="max-w-[200px]">
                      <p className="truncate">{holding.fundName}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{holding.type || 'Equity'}</Badge>
                  </TableCell>
                  <TableCell>{formatCurrency(holding.currentNAV)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {holding.navDate}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatCurrency(holding.invested)}</TableCell>
                  <TableCell>{holding.units.toFixed(3)}</TableCell>
                  <TableCell>{formatCurrency(holding.currentValue)}</TableCell>
                  <TableCell>
                    <div className={`font-medium ${
                      holding.profitLoss >= 0 ? 'text-success' : 'text-destructive'
                    }`}>
                      {formatCurrency(holding.profitLoss)}
                    </div>
                  </TableCell>
                  <TableCell className={sidebarOpen ? "hidden" : "table-cell"}>
                    <div className={`font-medium ${
                      holding.profitLoss >= 0 ? 'text-success' : 'text-destructive'
                    }`}>
                      {((holding.profitLoss / holding.invested) * 100).toFixed(2)}%
                    </div>
                  </TableCell>
                  <TableCell className={sidebarOpen ? "hidden" : "table-cell"}>
                    <div className={`font-medium ${
                      (holding.dayChange || 0) >= 0 ? 'text-success' : 'text-destructive'
                    }`}>
                      {formatCurrency(holding.dayChange || 0)}
                    </div>
                  </TableCell>
                  <TableCell className={sidebarOpen ? "hidden" : "table-cell"}>
                    <div className={`font-medium ${
                      (holding.dayChangePercent || 0) >= 0 ? 'text-success' : 'text-destructive'
                    }`}>
                      {holding.dayChangePercent || '0.00'}%
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => setDeleteId(holding.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Holding</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this holding? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          {deleteError && <div className="text-sm text-destructive mb-2">{deleteError}</div>}
                          <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setDeleteId(null)}>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              disabled={deleting}
                              onClick={async () => {
                                setDeleting(true);
                                setDeleteError("");
                                try {
                                  const token = localStorage.getItem('token');
                                  const response = await fetch(`http://localhost:3003/api/v1/portfolios/holding/${deleteId}`, {
                                    method: 'DELETE',
                                    headers: {
                                      'Content-Type': 'application/json',
                                      'Authorization': `Bearer ${token}`
                                    }
                                  });
                                  if (!response.ok) throw new Error('Failed to delete holding');
                                  setDeleteId(null);
                                  setDeleting(false);
                                  onRemoveHolding(deleteId!);
                                } catch (err) {
                                  setDeleteError("Failed to delete holding. Please try again.");
                                  setDeleting(false);
                                }
                              }}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredAndSortedHoldings.length === 0 && (
          <div className="text-center py-8">
            <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No holdings found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? "Try adjusting your search query" : "Start by adding funds to your portfolio"}
            </p>
            {!searchQuery && (
              <Button onClick={onAddMoreFunds} className="bg-gradient-primary hover:opacity-90">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Fund
              </Button>
            )}
          </div>
        )}
      </CardContent>

      {selectedFund && !onSipClick && (
        <SipTransactionModal
          isOpen={sipModalOpen}
          onClose={() => setSipModalOpen(false)}
          fundName={selectedFund.name}
          fundId={selectedFund.id}
        />
      )}
    </Card>
  );
};

export default PortfolioTable;