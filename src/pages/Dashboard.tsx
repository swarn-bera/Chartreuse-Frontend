import { useState, useEffect } from "react";
import Loader from "@/components/ui/Loader";
import { TrendingUp, Plus, Briefcase, Calendar, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import CreatePortfolioNameModal from "@/components/CreatePortfolioNameModal";

const Dashboard = () => {
  const [user, setUser] = useState<{ name?: string | null; email?: string | null }>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_URL_AUTH}/api/v1/users/me`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) throw new Error('Failed to fetch user');
        const result = await response.json();
        if (result?.data) {
          setUser({ name: result.data.name || 'Guest', email: result.data.email });
        } else {
          setUser({ name: 'Guest', email: null });
        }
      } catch (error) {
        setUser({ name: 'Guest', email: null });
      }
    };
    fetchUser();
  }, []);
  const navigate = useNavigate();
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchPortfolios = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
  const response = await fetch(`${import.meta.env.VITE_API_URL_PORTFOLIO}/api/v1/portfolios/names/portfolio`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch portfolios');
      const data = await response.json();
      setPortfolios(data);
    } catch (error) {
      setPortfolios([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolios();
  }, []);

  // Portfolio creation is handled by backend and modal itself

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Show loader while fetching
  if (loading) {
    return <Loader text="Loading portfolios..." />;
  }

  // Empty portfolio state
  if (portfolios.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-6 max-w-md">
          <div className="space-y-3">
            <TrendingUp className="h-16 w-16 mx-auto text-primary" />
            <h1 className="text-3xl font-bold">Welcome to Chartreuse!</h1>
            <p className="text-muted-foreground text-lg">
              Start building your investment portfolio and track your journey to financial success.
            </p>
          </div>
          <Button 
            size="lg" 
            className="bg-gradient-primary hover:opacity-90 transition-opacity"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Portfolio
          </Button>
        </div>

        <CreatePortfolioNameModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreatePortfolio={() => setIsCreateModalOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Portfolio Dashboard</h1>
          <p className="text-muted-foreground">Manage all your investment portfolios in one place</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-muted w-8 h-8 flex items-center justify-center font-bold text-lg">
                {(user?.name ? user.name.charAt(0).toUpperCase() : 'G')}
              </div>
              <span className="font-semibold">{user?.name || 'Guest'}</span>
            </div>
            {user?.email && (
              <span className="text-xs text-muted-foreground">{user.email}</span>
            )}
          </div>
          <Button 
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-gradient-primary hover:opacity-90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Portfolio
          </Button>
        </div>
      </div>

      {/* Portfolio Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {portfolios.map((portfolio: any) => (
          <Card 
            key={portfolio.id} 
            className="hover:shadow-medium transition-shadow cursor-pointer"
            onClick={() => navigate(`/dashboard/portfolio/${portfolio.id}`)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{portfolio.name}</CardTitle>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardDescription className="flex items-center gap-2">
                <Calendar className="h-3 w-3" />
                Created {new Date(portfolio.createdAt).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <CreatePortfolioNameModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreatePortfolio={() => {
          setIsCreateModalOpen(false);
          fetchPortfolios();
        }}
      />
    </div>
  );
};

export default Dashboard;