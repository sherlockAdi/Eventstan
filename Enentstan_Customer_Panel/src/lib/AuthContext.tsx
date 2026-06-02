"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  type: "individual" | "corporate";
  joinedAt: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signup: (name: string, email: string, password: string, type: "individual" | "corporate") => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const DEMO_USERS: (AuthUser & { password: string })[] = [
  { id: "u1", name: "Priya Sharma",    email: "priya@email.com", password: "demo123", avatar: "PS", type: "individual", joinedAt: "2024-01-10" },
  { id: "u2", name: "James Whitfield", email: "james@corp.com",  password: "demo123", avatar: "JW", type: "corporate",  joinedAt: "2024-02-05" },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,    setUser]    = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("es_user");
      if (stored) setUser(JSON.parse(stored));
    } catch {}
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    await new Promise(r => setTimeout(r, 900));

    const demo = DEMO_USERS.find(u => u.email === email.toLowerCase() && u.password === password);
    if (demo) {
      const { password: _, ...authUser } = demo;
      setUser(authUser);
      localStorage.setItem("es_user", JSON.stringify(authUser));
      return { ok: true };
    }

    try {
      const registered = JSON.parse(localStorage.getItem("es_registered") || "[]") as (AuthUser & { password: string })[];
      const found = registered.find(u => u.email === email.toLowerCase() && u.password === password);
      if (found) {
        const { password: _, ...authUser } = found;
        setUser(authUser);
        localStorage.setItem("es_user", JSON.stringify(authUser));
        return { ok: true };
      }
    } catch {}

    return { ok: false, error: "Invalid email or password." };
  };

  const signup = async (name: string, email: string, password: string, type: "individual" | "corporate") => {
    await new Promise(r => setTimeout(r, 1000));

    const allEmails = [
      ...DEMO_USERS.map(u => u.email),
      ...JSON.parse(localStorage.getItem("es_registered") || "[]").map((u: AuthUser) => u.email),
    ];
    if (allEmails.includes(email.toLowerCase())) {
      return { ok: false, error: "An account with this email already exists." };
    }

    const initials = name.trim().split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    const newUser: AuthUser & { password: string } = {
      id: `u_${Date.now()}`,
      name: name.trim(),
      email: email.toLowerCase(),
      avatar: initials,
      type,
      joinedAt: new Date().toISOString().split("T")[0],
      password,
    };

    const registered = JSON.parse(localStorage.getItem("es_registered") || "[]");
    registered.push(newUser);
    localStorage.setItem("es_registered", JSON.stringify(registered));

    const { password: _, ...authUser } = newUser;
    setUser(authUser);
    localStorage.setItem("es_user", JSON.stringify(authUser));
    return { ok: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("es_user");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}