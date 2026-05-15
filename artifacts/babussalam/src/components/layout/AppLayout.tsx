import React from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, LayoutDashboard, UserPlus, Users, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, username, logout, isLoading } = useAuth();
  const [location] = useLocation();

  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Loading...</div>;
  }

  if (!isAuthenticated && location !== "/login") {
    return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Redirecting...</div>;
  }

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  const NavItems = () => (
    <>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight uppercase">
            Divisi Ibadah
          </h2>
          <div className="space-y-1">
            <Link href="/dashboard">
              <Button variant={location === "/dashboard" || location === "/" ? "secondary" : "ghost"} className="w-full justify-start rounded-none border border-transparent">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <Link href="/pendataan">
              <Button variant={location === "/pendataan" ? "secondary" : "ghost"} className="w-full justify-start rounded-none border border-transparent">
                <UserPlus className="mr-2 h-4 w-4" />
                Pendataan
              </Button>
            </Link>
            <Link href="/mukholif">
              <Button variant={location.startsWith("/mukholif") ? "secondary" : "ghost"} className="w-full justify-start rounded-none border border-transparent">
                <Users className="mr-2 h-4 w-4" />
                Daftar Mukholif
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <div className="mt-auto p-4 border-t border-border">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">@{username}</div>
          <Button variant="ghost" size="icon" onClick={logout} className="rounded-none hover:bg-destructive hover:text-destructive-foreground transition-colors">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden border-b border-border p-4 flex items-center justify-between">
        <span className="font-bold tracking-tight uppercase">Divisi Ibadah</span>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="rounded-none">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 flex flex-col rounded-none border-r border-border bg-card">
            <NavItems />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col w-64 border-r border-border bg-card">
        <NavItems />
      </div>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-auto">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
