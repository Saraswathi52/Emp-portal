import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Role = "Employee" | "Manager" | "Admin";
export type User = { name: string; email: string; role: Role };

type AuthCtx = {
  user: User | null;
  login: (u: User) => void;
  logout: () => void;
};

const Ctx = createContext<AuthCtx | null>(null);
const KEY = "emp-portal-user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      try { setUser(JSON.parse(raw)); } catch {}
    }
  }, []);
  const login = (u: User) => {
    setUser(u);
    window.localStorage.setItem(KEY, JSON.stringify(u));
  };
  const logout = () => {
    setUser(null);
    window.localStorage.removeItem(KEY);
  };
  return <Ctx.Provider value={{ user, login, logout }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
}
