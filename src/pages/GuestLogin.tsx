import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Shield, User } from "lucide-react";

const GuestLogin = () => {
  const [guestName, setGuestName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleGuestLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Call backend guest login API
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL_AUTH}/api/v1/users/guest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ guest: guestName })
      });
      const data = await response.json();
      if (response.ok && data.data?.token) {
        // Store JWT token
        localStorage.setItem("token", data.data.token);
        // Redirect to dashboard
        window.location.href = "/dashboard";
      } else {
        alert(data.message || "Guest login failed. Please try again.");
      }
    } catch (err) {
      alert("Network error. Please try again later.");
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <TrendingUp className="h-8 w-8 text-white" />
            <h1 className="text-2xl font-bold text-white">Chartreuse</h1>
          </div>
          <p className="text-white/80">Quick access to explore your investments</p>
        </div>

        <Card className="shadow-strong border-0">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Guest Access</CardTitle>
            <CardDescription className="text-center">
              Continue without creating an account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGuestLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="guestName">Your Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="guestName"
                    type="text"
                    placeholder="Enter your name"
                    className="pl-9"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                size="lg" 
                disabled={isLoading || !guestName.trim()}
              >
                {isLoading ? "Continuing..." : "Continue as Guest"}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Want full features?{" "}
                <Link to="/signup" className="text-primary hover:underline font-medium">
                  Create an account
                </Link>
              </p>
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Sign in
                </Link>
              </p>
            </div>

            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>Guest sessions are temporary and data won't be saved</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GuestLogin;