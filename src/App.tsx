import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import GuestLogin from "./pages/GuestLogin";
import Dashboard from "./pages/Dashboard";
import PortfolioView from "./pages/PortfolioView";
import DashboardLayout from "./pages/DashboardLayout";
import SIPCalculator from "./components/SipCalculator";
import GoalPlanner from "./components/GoalPlanner";
import FundSearch from "./components/FundSearch";
import AIInsights from "./components/AIInsights";
import SavedPlans from "./components/SavedPlans";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/guest-login" element={<GuestLogin />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="portfolio/:portfolioId" element={<PortfolioView />} />
            <Route path="calculator" element={<SIPCalculator />} />
            <Route path="goal-planner" element={<GoalPlanner />} />
            <Route path="search" element={<FundSearch />} />
            <Route path="insights" element={<AIInsights />} />
            <Route path="plans" element={<SavedPlans />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
