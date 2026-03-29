import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type UserRole = "BUYER" | "SELLER";

interface AuthUser {
  userId: string;
  role: UserRole;
  email?: string;
  firstName?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("ecomm_token")
  );
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem("ecomm_user");
    return stored ? (JSON.parse(stored) as AuthUser) : null;
  });

  useEffect(() => {
    if (token) {
      localStorage.setItem("ecomm_token", token);
    } else {
      localStorage.removeItem("ecomm_token");
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem("ecomm_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("ecomm_user");
    }
  }, [user]);

  const login = (newToken: string, newUser: AuthUser) => {
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
