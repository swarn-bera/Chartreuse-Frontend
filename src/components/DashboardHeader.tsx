import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function DashboardHeader() {
  // Get user data from token/localStorage
  const [userData, setUserData] = useState<{ name: string; email?: string; initials: string }>({ name: "", email: "", initials: "" });

  useEffect(() => {
    // Get token from localStorage
    const token = localStorage.getItem("token");
    // Decode token to get user info (simple base64 decode for demo, use jwt-decode in real app)
    // For now, get user info from localStorage or backend
    // You can replace this with a call to /api/v1/users/me if needed
    const userRaw = localStorage.getItem("user");
    if (userRaw) {
      const user = JSON.parse(userRaw);
      setUserData({
        name: user.name || "Guest",
        email: user.email,
        initials: user.name ? user.name.split(" ").map((n: string) => n[0]).join("") : "G"
      });
    } else {
      // Fallback: just show Guest
      setUserData({ name: "Guest", initials: "G" });
    }
  }, []);

  const handleLogout = () => {
    // Clear tokens and user info
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // Redirect to login
    window.location.href = "/login";
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-end px-4 lg:px-6">
        {/* Left side - Sidebar trigger and search */}
        <div className="flex items-center gap-4 flex-1">
          <SidebarTrigger />
          
        </div>

        {/* Right side - Theme toggle and user info */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {/* User info and logout */}
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                {userData.initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start">
              <span className="font-bold text-base leading-tight text-foreground max-w-[160px] truncate">{userData.name}</span>
              {/* Only show email if not guest */}
              {userData.email && (
                <span className="text-xs text-muted-foreground max-w-[160px] truncate" title={userData.email}>
                  {userData.email}
                </span>
              )}
            </div>
            {/* Logout button removed from top right. Use sidebar/bottom left logout instead. */}
          </div>
        </div>
      </div>
    </header>
  );
}