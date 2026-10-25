import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@simsimplay/shared";
import { api } from "../api";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  refreshUser(): Promise<User | null>;
  logout(): void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api.getCurrentUser()
      .then((currentUser) => {
        if (active) setUser(currentUser);
      })
      .catch(() => {
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function refreshUser(): Promise<User | null> {
    const currentUser = await api.getCurrentUser();
    setUser(currentUser);
    return currentUser;
  }

  function logout(): void {
    api.logout();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}