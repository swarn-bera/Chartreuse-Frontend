import { useState } from "react";
import Loader from "@/components/ui/Loader";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AddHoldingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddHolding: (fund: any, invested: number, units: number, monthlySip: number) => void;
  portfolioId: string;
}

const AddHoldingModal = ({ isOpen, onClose, onAddHolding, portfolioId }: AddHoldingModalProps) => {
  const [selectedFund, setSelectedFund] = useState<any>(null);
  const [fundSearch, setFundSearch] = useState("");
  const [fundResults, setFundResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [addingLoading, setAddingLoading] = useState(false);
  const [invested, setInvested] = useState("");
  const [units, setUnits] = useState("");
  const [monthlySip, setMonthlySip] = useState("");
  const [investmentType, setInvestmentType] = useState("LumpSum");
  const [errorMsg, setErrorMsg] = useState("");


  const handleSubmit = async () => {
    setErrorMsg("");
    if (selectedFund && invested && units) {
      setAddingLoading(true);
      const token = localStorage.getItem('token');
      const payload = {
        portfolioId,
        fundSchemeCode: selectedFund.schemeCode,
        fundName: selectedFund.schemeName,
        fundType: investmentType,
        totalInvested: parseFloat(invested),
        totalUnits: parseFloat(units),
        activeSIPAmount: investmentType === 'SIP' ? parseFloat(monthlySip) || 0 : 0
      };
      try {
  const response = await fetch(`${import.meta.env.VITE_API_URL_PORTFOLIO}/api/v1/portfolios/add-holding`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
        if (!response.ok) {
          const errData = await response.json();
          if (response.status === 400 && errData.error?.includes("Holding already exists")) {
            setErrorMsg("This holding already exists in your portfolio.");
            setAddingLoading(false);
            return;
          }
          throw new Error('Failed to add holding');
        }
        const data = await response.json();
        onAddHolding(data, payload.totalInvested, payload.totalUnits, payload.activeSIPAmount);
        resetForm();
        onClose();
      } catch (error) {
        setErrorMsg("Failed to add holding. Please try again.");
        console.error(error);
      } finally {
        setAddingLoading(false);
      }
    }
  };
  // Search funds from backend
  const handleFundSearch = async (search: string) => {
    setFundSearch(search);
    setSearchLoading(true);
    try {
      const token = localStorage.getItem('token');
  const response = await fetch(`${import.meta.env.VITE_API_URL_FUNDS}/api/v1/mutual-funds?search=${encodeURIComponent(search)}&page=1&limit=5`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch funds');
      const data = await response.json();
      setFundResults(data.funds || []);
    } catch (error) {
      setFundResults([]);
    }
    setSearchLoading(false);
  };

  const resetForm = () => {
    setSelectedFund("");
    setInvested("");
    setUnits("");
    setMonthlySip("");
    setInvestmentType("LumpSum");
    setErrorMsg("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Holding</DialogTitle>
          <DialogDescription>
            Add a new mutual fund to your portfolio
          </DialogDescription>
        </DialogHeader>

        {addingLoading ? (
          <Loader text="Adding holding..." />
        ) : (
          <div className="space-y-4">
            {errorMsg && (
              <div className="text-sm text-destructive bg-destructive/10 rounded px-3 py-2 mb-2">
                {errorMsg}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="fund">Select Fund</Label>
              <Input
                id="fundSearch"
                placeholder="Type to search mutual funds..."
                value={fundSearch}
                onChange={e => handleFundSearch(e.target.value)}
                autoComplete="off"
              />
              {fundResults.length > 0 && (
                <div
                  className="border rounded bg-popover mt-2 max-h-40 overflow-y-auto"
                  style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: 'rgba(0,0,0,0.1) rgba(0,0,0,0)',
                  }}
                >
                  <style>{`
                    .fund-scroll::-webkit-scrollbar { width: 6px; background: transparent; }
                    .fund-scroll::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 3px; }
                  `}</style>
                  <div className="fund-scroll">
                    {fundResults.map(fund => (
                      <div
                        key={fund.schemeCode}
                        className={`px-3 py-2 cursor-pointer hover:bg-primary/10 ${selectedFund?.schemeCode === fund.schemeCode ? 'bg-primary/20' : ''}`}
                        onClick={() => { setSelectedFund(fund); setFundSearch(fund.schemeName); setFundResults([]); }}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          maxWidth: '100%',
                          overflow: 'hidden',
                        }}
                      >
                        <div className="text-sm font-semibold" style={{whiteSpace: 'normal', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%'}}>{fund.schemeName}</div>
                        <div className="text-xs text-muted-foreground" style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%'}}>{fund.fundHouse} | {fund.category}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="investmentType">Investment Type</Label>
              <Select value={investmentType} onValueChange={setInvestmentType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select investment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LumpSum">Lump Sum</SelectItem>
                  <SelectItem value="SIP">SIP</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="invested">Amount Invested (₹)</Label>
                <Input
                  id="invested"
                  type="number"
                  placeholder="Enter amount"
                  value={invested}
                  onChange={(e) => setInvested(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="units">Units Purchased</Label>
                <Input
                  id="units"
                  type="number"
                  placeholder="Enter units"
                  value={units}
                  onChange={(e) => setUnits(e.target.value)}
                />
              </div>
            </div>

            {investmentType === "SIP" && (
              <div className="space-y-2">
                <Label htmlFor="monthlySip">Monthly SIP (₹)</Label>
                <Input
                  id="monthlySip"
                  type="number"
                  placeholder="Enter monthly SIP amount"
                  value={monthlySip}
                  onChange={(e) => setMonthlySip(e.target.value)}
                />
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={!selectedFund || !invested || !units}
                className="bg-gradient-primary hover:opacity-90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Holding
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddHoldingModal;