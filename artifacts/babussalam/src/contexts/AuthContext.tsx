import React, { createContext, useContext, useEffect, useState } from "react";
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
  const [_, setLocation] = useLocation();
  const { toast } = useToast();

  const { data, isLoading, refetch, isError } = useGetMe({
    query: {
      retry: false,
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
      }
    }
  });

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

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      username,
      isLoading,
      logout: handleLogout,
      checkAuth: () => refetch()
    }}>
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
