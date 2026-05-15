import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { useGetMe, useLogout } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  isAuthenticated: boolean;
  username: string | null;
  isLoading: boolean;
  logout: () => void;
  checkAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [username, setUsername] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // PERBAIKAN: Menambahkan queryKey dan struktur yang benar
  const { data, isLoading, refetch, isError } = useGetMe({
    query: {
      queryKey: ["get-me"], // Wajib ada agar build tidak error
      retry: false,
      staleTime: 1000 * 60 * 5, // Optional: data dianggap segar selama 5 menit
    }
  });

  const logoutMutation = useLogout({
    mutation: {
      onSuccess: () => {
        setIsAuthenticated(false);
        setUsername(null);
        setLocation("/login");
        toast({
          title: "Logged out",
          description: "You have been logged out successfully.",
        });
      },
      onError: (error: any) => {
        toast({
          variant: "destructive",
          title: "Logout Failed",
          description: error?.message || "An error occurred during logout.",
        });
      }
    }
  });

  // Sinkronisasi status auth saat data dari useGetMe berubah
  useEffect(() => {
    if (data) {
      setIsAuthenticated(data.authenticated);
      setUsername(data.username || null);
    } else if (isError) {
      setIsAuthenticated(false);
      setUsername(null);
    }
  }, [data, isError]);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Menggunakan useMemo agar object context tidak re-render kecuali value berubah
  const value = useMemo(() => ({
    isAuthenticated,
    username,
    isLoading,
    logout: handleLogout,
    checkAuth: () => {
        refetch();
    }
  }), [isAuthenticated, username, isLoading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}