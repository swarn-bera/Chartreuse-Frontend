import { useState, useEffect } from "react";
import { BookmarkCheck, Edit, Trash2, Plus, Calculator, Target, Calendar, TrendingUp, Download, FileText, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface SavedPlan {
  id: string;
  name: string;
  type: 'sip' | 'goal' | 'investment';
  description: string;
  amount: number;
  duration: number;
  expectedReturn: number;
  targetAmount?: number;
  currentValue?: number;
  createdAt: string;
  lastModified: string;
  status: 'active' | 'paused' | 'completed' | 'draft';
  progress?: number;
  monthlySIPAmount: string;
  durationMonths: number;
  expectedAnnualReturn: string;
  updatedAt?: string;
}

const SavedPlans = () => {
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<SavedPlan | null>(null);
  const [downloadLoading, setDownloadLoading] = useState<{ [key: string]: 'pdf' | 'csv' | null }>({});
  const [showTaxAdjustedList, setShowTaxAdjustedList] = useState(false);
  const [showTaxAdjustedDetails, setShowTaxAdjustedDetails] = useState(false);
  const [summary, setSummary] = useState({ totalPlans: 0, totalTargetAmount: 0, totalMonthlySIP: 0 });

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const token = localStorage.getItem('token');
  const response = await fetch(`${import.meta.env.VITE_API_URL_PORTFOLIO}/api/v1/goal-plans/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) throw new Error('Failed to fetch plans');
        const data = await response.json();
        setSavedPlans(data.plans || []);
        setSummary({
          totalPlans: data.totalPlans,
          totalTargetAmount: data.totalTargetAmount,
          totalMonthlySIP: data.totalMonthlySIP
        });
      } catch (error) {
        setSavedPlans([]);
        setSummary({ totalPlans: 0, totalTargetAmount: 0, totalMonthlySIP: 0 });
      }
    };
    fetchPlans();
  }, []);

  const deletePlan = async (planId: string) => {
    try {
      const token = localStorage.getItem('token');
  const response = await fetch(`${import.meta.env.VITE_API_URL_PORTFOLIO}/api/v1/goal-plans/${planId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to delete plan');
      setSavedPlans(prev => prev.filter(plan => plan.id !== planId));
      alert('Plan deleted successfully!');
    } catch (error) {
      console.error('Error deleting plan:', error);
      alert('Error deleting plan. Please try again.');
    }
  };

  const editPlan = (plan: SavedPlan) => {
    // TODO: Implement edit plan functionality
    // - Navigate to plan editor with pre-filled data
    // - Allow modification of plan parameters
    // - Validate changes and update backend
    // - Show updated calculations
    
    console.log('Editing plan:', plan.id);
    setSelectedPlan(plan);
    alert('Edit functionality will open plan editor...');
  };

  const activatePlan = async (planId: string) => {
    // TODO: Implement plan activation
    // - Change plan status from draft to active
    // - Start SIP if applicable
    // - Send to fund house/broker for execution
    // - Update plan status in backend
    
    try {
      console.log('Activating plan:', planId);
      setSavedPlans(prev => 
        prev.map(plan => 
          plan.id === planId 
            ? { ...plan, status: 'active' as const, lastModified: new Date().toISOString().split('T')[0] }
            : plan
        )
      );
      alert('Plan activated successfully!');
    } catch (error) {
      console.error('Error activating plan:', error);
      alert('Error activating plan. Please try again.');
    }
  };

  const pausePlan = async (planId: string) => {
    // TODO: Implement plan pause functionality
    // - Pause active SIPs
    // - Update status in backend
    // - Send pause request to fund house
    // - Allow resume functionality
    
    try {
      console.log('Pausing plan:', planId);
      setSavedPlans(prev => 
        prev.map(plan => 
          plan.id === planId 
            ? { ...plan, status: 'paused' as const, lastModified: new Date().toISOString().split('T')[0] }
            : plan
        )
      );
      alert('Plan paused successfully!');
    } catch (error) {
      console.error('Error pausing plan:', error);
      alert('Error pausing plan. Please try again.');
    }
  };

  const downloadPlan = async (planId: string, format: 'pdf' | 'csv') => {
    setDownloadLoading(prev => ({ ...prev, [planId]: format }));
    
    try {
      const response = await fetch(`/export/plan/${planId}/${format}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to download ${format.toUpperCase()}`);
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `plan-${planId}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      alert(`${format.toUpperCase()} downloaded successfully!`);
    } catch (error) {
      console.error(`Error downloading ${format}:`, error);
      alert(`Error downloading ${format.toUpperCase()}. Please try again.`);
    } finally {
      setDownloadLoading(prev => ({ ...prev, [planId]: null }));
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'paused': return 'warning';
      case 'completed': return 'default';
      case 'draft': return 'secondary';
      default: return 'secondary';
    }
  };

  const getPlanIcon = (type: string) => {
    switch (type) {
      case 'sip': return <Calculator className="h-5 w-5 text-primary" />;
      case 'goal': return <Target className="h-5 w-5 text-success" />;
      case 'investment': return <TrendingUp className="h-5 w-5 text-warning" />;
      default: return <BookmarkCheck className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookmarkCheck className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Saved Plans</h1>
            <p className="text-muted-foreground">Manage your investment plans and track progress</p>
          </div>
        </div>
      </div>

      {/* Plans Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Plans</p>
                <p className="text-2xl font-bold">{summary.totalPlans}</p>
              </div>
              <BookmarkCheck className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monthly Investment</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(Number(summary.totalMonthlySIP))}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Target Amount</p>
                <p className="text-2xl font-bold text-success">
                  {formatCurrency(Number(summary.totalTargetAmount))}
                </p>
              </div>
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plans Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {savedPlans.map((plan) => (
          <Card key={plan.id} className="shadow-soft hover:shadow-medium transition-all duration-300">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getPlanIcon(plan.type)}
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusColor(plan.status) as any}>
                    {plan.status}
                  </Badge>
                  {showTaxAdjustedList && (
                    <Badge variant="outline" className="text-xs">
                      After Tax
                    </Badge>
                  )}
                </div>
              </div>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Monthly Amount</p>
                  <p className="font-medium">{formatCurrency(Number(plan.monthlySIPAmount))}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Duration</p>
                  <p className="font-medium">{plan.durationMonths} months</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Expected Return</p>
                  <p className="font-medium">{plan.expectedAnnualReturn}% p.a.</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Target Amount</p>
                  <p className="font-medium">
                    {showTaxAdjustedList 
                      ? formatCurrency(Number(plan.targetAmount) * 0.8) 
                      : formatCurrency(Number(plan.targetAmount))
                    }
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-muted-foreground">
                  {new Date(plan.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                </p>
                
                <div className="flex items-center gap-1">
                  <Dialog>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>{plan.name} - Details</DialogTitle>
                        <DialogDescription>
                          Detailed view of your investment plan
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        

                        <div className="grid grid-cols-2 gap-4">
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-lg">Plan Overview</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div>
                                <p className="text-sm text-muted-foreground">Type</p>
                                <p className="font-medium capitalize">{plan.type} Plan</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Monthly Amount</p>
                                <p className="font-medium">{formatCurrency(plan.amount)}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Duration</p>
                                <p className="font-medium">{plan.duration} months</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Expected Return</p>
                                <p className="font-medium">{plan.expectedReturn}% p.a.</p>
                              </div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-lg">Financial Projections</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  {showTaxAdjustedDetails ? 'Before Tax' : ''} Target Amount
                                </p>
                                <p className="font-medium">{formatCurrency(plan.targetAmount || 0)}</p>
                              </div>
                              
                              {showTaxAdjustedDetails && (
                                <>
                                  <div>
                                    <p className="text-sm text-muted-foreground">After Tax Amount</p>
                                    <p className="font-medium text-orange-600">
                                      {formatCurrency((plan.targetAmount || 0) * 0.8)}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Estimated Tax</p>
                                    <p className="font-medium text-red-600">
                                      {formatCurrency((plan.targetAmount || 0) * 0.2)}
                                    </p>
                                  </div>
                                </>
                              )}
                              
                              <div>
                                <p className="text-sm text-muted-foreground">Current Value</p>
                                <p className="font-medium text-success">
                                  {formatCurrency(plan.currentValue || 0)}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Progress</p>
                                <p className="font-medium">{plan.progress || 0}%</p>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" color="red"/>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Plan</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{plan.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => deletePlan(plan.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  {plan.status === 'draft' && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => activatePlan(plan.id)}
                    >
                      Activate
                    </Button>
                  )}

                  {plan.status === 'active' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => pausePlan(plan.id)}
                    >
                      Pause
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {savedPlans.length === 0 && (
        <Card className="shadow-soft">
          <CardContent className="py-16 text-center">
            <BookmarkCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Saved Plans</h3>
            <p className="text-muted-foreground mb-4">
              Create your first investment plan to start building wealth systematically.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SavedPlans;