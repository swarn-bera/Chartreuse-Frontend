import { useState, useEffect } from "react";
import Loader from "@/components/ui/Loader";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, TrendingUp, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import PortfolioSummary from "@/components/PortfolioSummary";
import PortfolioTable from "@/components/PortfolioTable";
import AddHoldingModal from "@/components/AddHoldingModal";
import SipTransactionModal from "@/components/SipTransactionModal";

const PortfolioView = () => {
  const { portfolioId } = useParams();
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const handleDeletePortfolio = async () => {
    setDeleting(true);
    try {
      const token = localStorage.getItem('token');
  const response = await fetch(`${import.meta.env.VITE_API_URL_PORTFOLIO}/api/v1/portfolios/${portfolioId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to delete portfolio');
      setDeleteDialogOpen(false);
      navigate('/dashboard');
    } catch (error) {
      // Optionally show error toast
      setDeleteDialogOpen(false);
    } finally {
      setDeleting(false);
    }
  };
  const [holdings, setHoldings] = useState([]);
  const [isAddHoldingModalOpen, setIsAddHoldingModalOpen] = useState(false);
  const [sipModalOpen, setSipModalOpen] = useState(false);
  const [selectedFund, setSelectedFund] = useState<{ id: string; name: string } | null>(null);

  const fetchPortfolio = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
  const response = await fetch(`${import.meta.env.VITE_API_URL_PORTFOLIO}/api/v1/portfolios/${portfolioId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Portfolio not found');
      const data = await response.json();
      setPortfolio(data);
      // Map backend holding properties to expected frontend names
      const mappedHoldings = (data.holdings || []).map(h => ({
        ...h,
        units: Number(h.totalUnits),
        invested: Number(h.totalInvested),
        navDate:  h.currentNAVDate ? new Date(h.currentNAVDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : '',
        type: h.fundType || 'Equity',
        dayChange: h.daysChange,
        dayChangePercent: h.daysChangePercent,
      }));
      setHoldings(mappedHoldings);
    } catch (error) {
      setPortfolio(null);
      setHoldings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, [portfolioId]);

  // Remove dummy add holding logic; should use backend for holdings

  // Remove dummy remove holding logic; should use backend for holdings

  const handleSipClick = (fundId: string, fundName: string) => {
    setSelectedFund({ id: fundId, name: fundName });
    setSipModalOpen(true);
  };

  if (loading) {
    return <Loader text="Loading portfolio..." />;
  }

  if (!portfolio) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Portfolio not found</h2>
          <Button onClick={() => navigate('/dashboard')} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Empty portfolio state
  if (holdings.length === 0) {
    return (
      <div className="space-y-6">
        {/* Header with Back and Delete Button */}
        <div className="flex items-center justify-between mb-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          {/* Delete Portfolio Button */}
          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="icon" title="Delete Portfolio">
                <Trash2 className="h-5 w-5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Portfolio</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this portfolio? This action cannot be undone and will remove all holdings.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
                <AlertDialogAction disabled={deleting} onClick={handleDeletePortfolio} style={{ backgroundColor: '#dc2626' }}>
                  {deleting ? 'Deleting...' : 'Delete'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Empty State */}
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-6 max-w-md">
            <div className="space-y-3">
              <TrendingUp className="h-16 w-16 mx-auto text-primary" />
              <h1 className="text-3xl font-bold">{portfolio.name}</h1>
              <p className="text-muted-foreground text-lg">
                Start adding holdings to build your investment portfolio.
              </p>
            </div>
            <Button 
              size="lg" 
              className="bg-gradient-primary hover:opacity-90 transition-opacity"
              onClick={() => setIsAddHoldingModalOpen(true)}
            >
              <Plus className="h-5 w-5 mr-2" />
              Add First Holding
            </Button>
          </div>

          <AddHoldingModal
            isOpen={isAddHoldingModalOpen}
            onClose={() => setIsAddHoldingModalOpen(false)}
            onAddHolding={() => {}}
            portfolioId={portfolioId as string}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{portfolio.name}</h1>
            <p className="text-muted-foreground">Portfolio performance and holdings</p>
          </div>
        </div>
        {/* Delete Portfolio Button */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="icon" title="Delete Portfolio">
              <Trash2 className="h-5 w-5" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Portfolio</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this portfolio? This action cannot be undone and will remove all holdings.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction disabled={deleting} onClick={handleDeletePortfolio} style={{ backgroundColor: '#dc2626' }}>
                {deleting ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Portfolio Summary */}
      <PortfolioSummary holdings={holdings} />

      {/* Portfolio Table */}
      <PortfolioTable 
        holdings={holdings} 
        onRemoveHolding={() => {
          fetchPortfolio();
        }}
        onAddMoreFunds={() => setIsAddHoldingModalOpen(true)}
        onSipClick={handleSipClick}
      />

      {/* Modals */}
      <AddHoldingModal
        isOpen={isAddHoldingModalOpen}
        onClose={() => setIsAddHoldingModalOpen(false)}
        onAddHolding={() => {
          fetchPortfolio();
        }}
        portfolioId={portfolioId as string}
      />

      {selectedFund && (
        <SipTransactionModal
          isOpen={sipModalOpen}
          onClose={() => setSipModalOpen(false)}
          fundName={selectedFund.name}
          fundId={selectedFund.id}
        />
      )}
    </div>
  );
};

export default PortfolioView;