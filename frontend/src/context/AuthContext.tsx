"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { API_BASE } from "@/lib/api";

interface User {
  id: string;
  username: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("fitly_token");
    if (!saved) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    const controller = new AbortController();

    async function fetchMe(attempt: number) {
      const timeoutMs = 4500;
      const t = window.setTimeout(() => controller.abort(), timeoutMs);

      try {
        const res = await fetch(`${API_BASE}/api/auth/me`, {
          headers: { Authorization: `Bearer ${saved}` },
          signal: controller.signal,
        });

        // Invalid token: clear immediately.
        if (res.status === 401) {
          localStorage.removeItem("fitly_token");
          if (!cancelled) {
            setToken(null);
            setUser(null);
          }
          return;
        }

        if (!res.ok) throw new Error(`me_failed_${res.status}`);

        const data = (await res.json()) as User;
        if (!cancelled) {
          setToken(saved);
          setUser(data);
        }
      } catch (err: unknown) {
        // Render cold starts can make the first request slow/hang.
        // Don't block the UI; retry once shortly after.
        if (attempt < 1 && !cancelled) {
          window.setTimeout(() => fetchMe(attempt + 1), 1500);
        }
      } finally {
        window.clearTimeout(t);
        if (!cancelled) setLoading(false);
      }
    }

    fetchMe(0);

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({ detail: "Login failed" }));
      throw new Error(body.detail || "Login failed");
    }

    const data = await res.json();
    localStorage.setItem("fitly_token", data.token);
    setToken(data.token);
    setUser(data.user);
  }, []);

  const signup = useCallback(async (username: string, password: string) => {
    const res = await fetch(`${API_BASE}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({ detail: "Signup failed" }));
      throw new Error(body.detail || "Signup failed");
    }

    const data = await res.json();
    localStorage.setItem("fitly_token", data.token);
    setToken(data.token);
    setUser(data.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("fitly_token");
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
