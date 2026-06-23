"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { customerApi, type ApiUser, type AuthResponse } from "@/api/customerApi";

export interface AuthUser extends ApiUser {
  avatar: string;
  type: "individual" | "corporate";
  joinedAt: string;
}

export function canAccessRoute(user: AuthUser | null, pathname: string) {
  if (!user?.permissions?.length) return true;
  return user.permissions.some((permission) => permission.view && permission.routes.some((route) => pathname === route || pathname.startsWith(`${route}/`)));
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string; name?: string }>;
  signup: (name: string, email: string, phone: string, password: string, type: "individual" | "corporate") => Promise<{ ok: boolean; error?: string; welcomeEmailSent?: boolean }>;
  logout: () => void;
  canAccessRoute: (pathname: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

function normalizeUser(user: ApiUser, type: "individual" | "corporate" = "individual"): AuthUser {
  return {
    ...user,
    avatar: user.name.split(" ").map(part => part[0]).join("").slice(0, 2).toUpperCase(),
    type,
    joinedAt: new Date().toISOString().slice(0, 10),
  };
}

function saveSession(response: AuthResponse, type: "individual" | "corporate" = "individual") {
  const user = normalizeUser(response.user, type);
  localStorage.setItem("es_token", response.accessToken);
  localStorage.setItem("es_user", JSON.stringify(user));
  return user;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("es_user");
    const authToken = localStorage.getItem("es_token");
    if (!stored || !authToken) {
      queueMicrotask(() => setLoading(false));
      return;
    }
    customerApi.auth.me()
      .then((account) => {
        if (account.role !== "CUSTOMER") throw new Error("Customer account required");
        const current = JSON.parse(stored) as AuthUser;
        const normalized = normalizeUser(account, current.type);
        setUser(normalized);
        localStorage.setItem("es_user", JSON.stringify(normalized));
      })
      .catch(() => {
        localStorage.removeItem("es_token");
        localStorage.removeItem("es_user");
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await customerApi.auth.login(email, password);
      if (response.user.role !== "CUSTOMER") return { ok: false, error: "Please use the correct portal for this account." };
      setUser(saveSession(response));
      return { ok: true, name: response.user.name };
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : "Login failed." };
    }
  };

  const signup = async (name: string, email: string, phone: string, password: string, type: "individual" | "corporate") => {
    try {
      const response = await customerApi.auth.register(name, email, phone, password);
      setUser(saveSession(response, type));
      return { ok: true, welcomeEmailSent: response.welcomeEmailSent };
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : "Sign up failed." };
    }
  };

  const logout = () => {
    void customerApi.auth.logout().catch(() => undefined);
    setUser(null);
    localStorage.removeItem("es_token");
    localStorage.removeItem("es_user");
  };

  return <AuthContext.Provider value={{ user, loading, login, signup, logout, canAccessRoute: (pathname) => canAccessRoute(user, pathname) }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
