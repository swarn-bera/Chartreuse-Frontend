import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

interface CreatePortfolioNameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatePortfolio: (name: string) => void;
}

const CreatePortfolioNameModal = ({ isOpen, onClose, onCreatePortfolio }: CreatePortfolioNameModalProps) => {
  const [portfolioName, setPortfolioName] = useState("");

  const handleSubmit = async () => {
    if (!portfolioName.trim()) return;
    try {
      const token = localStorage.getItem('token');
  const response = await fetch(`${import.meta.env.VITE_API_URL_PORTFOLIO}/api/v1/portfolios/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: portfolioName.trim() })
      });
      if (!response.ok) throw new Error('Failed to create portfolio');
      const data = await response.json();
      // Optionally, pass the created portfolio data to parent
      onCreatePortfolio(data.name);
      setPortfolioName("");
      onClose();
    } catch (error) {
      alert('Error creating portfolio. Please try again.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Portfolio</DialogTitle>
          <DialogDescription>
            Give your portfolio a name to get started
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="portfolioName">Portfolio Name</Label>
            <Input
              id="portfolioName"
              placeholder="e.g., My Portfolio, Family Investments, etc."
              value={portfolioName}
              onChange={(e) => setPortfolioName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!portfolioName.trim()}
              className="bg-gradient-primary hover:opacity-90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Portfolio
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePortfolioNameModal;