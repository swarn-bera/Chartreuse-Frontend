import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function DashboardHeader() {
  const [userData, setUserData] = useState<{ name?: string; email?: string | null; initials?: string }>({});

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${import.meta.env.VITE_API_URL_AUTH}/api/v1/users/me`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });
        if (!response.ok) throw new Error("Failed to fetch user");
        const result = await response.json();
        if (result?.data) {
          setUserData({
            name: result.data.name || "Guest",
            email: result.data.email,
            initials: result.data.name ? result.data.name.split(" ").map((n: string) => n[0]).join("") : "G"
          });
        } else {
          setUserData({ name: "Guest", initials: "G" });
        }
      } catch (error) {
        setUserData({ name: "Guest", initials: "G" });
      }
    };
    fetchUser();
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