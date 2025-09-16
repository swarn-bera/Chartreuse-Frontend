import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Calculator,
  Search,
  Brain,
  BookmarkCheck,
  BarChart3,
  TrendingUp,
  Target,
  Settings,
  LogOut,
  Menu,
  X
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigationItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: BarChart3,
    description: "Overview of your investments"
  },
  {
    title: "SIP Calculator",
    url: "/dashboard/calculator",
    icon: Calculator,
    description: "Calculate SIP returns"
  },
  {
    title: "Goal Planner",
    url: "/dashboard/goal-planner",
    icon: Target,
    description: "Plan financial goals"
  },
  {
    title: "Fund Search",
    url: "/dashboard/search",
    icon: Search,
    description: "Find mutual funds"
  },
  {
    title: "AI Insights",
    url: "/dashboard/insights",
    icon: Brain,
    description: "Investment recommendations"
  },
  {
    title: "Saved Plans",
    url: "/dashboard/plans",
    icon: BookmarkCheck,
    description: "Your saved investment plans"
  }
];

const secondaryItems = [
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings,
    description: "Account settings"
  }
];

export function DashboardSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const isCollapsed = state === "collapsed";

  const handleLogout = () => {
    // Clear JWT token and user info from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // Redirect to login page
    window.location.href = "/login";
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="bg-card border-r">
        {/* Logo Section */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-8 w-8 text-primary" />
            {!isCollapsed && (
              <div>
                <h1 className="text-lg font-bold text-foreground">Chartreuse</h1>
                <p className="text-xs text-muted-foreground">Investment Manager</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className={cn("px-4 py-2", isCollapsed && "sr-only")}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end={item.url === "/dashboard"}
                      className={({ isActive }) => cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        "hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        isActive ? "bg-primary/10 text-primary border-r-2 border-primary" : "text-muted-foreground hover:text-foreground"
                      )}
                      title={isCollapsed ? item.title : undefined}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!isCollapsed && (
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">{item.title}</div>
                          <div className="text-xs text-muted-foreground truncate">
                            {item.description}
                          </div>
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Secondary Navigation */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {secondaryItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className={cn(
                      "w-full justify-start gap-3 px-3 py-2 h-auto text-sm font-medium",
                      "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                    title={isCollapsed ? "Logout" : undefined}
                  >
                    <LogOut className="h-4 w-4 shrink-0" />
                    {!isCollapsed && <span>Logout</span>}
                  </Button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}