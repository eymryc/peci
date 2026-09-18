"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiRequestError } from "@/lib/api";
import type { AuthUser } from "@/types";

const TOKEN_KEY = "peci_token";
const USER_KEY = "peci_user";

interface LoginResponse {
  token: string;
  user: AuthUser;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Lu uniquement après le montage (jamais pendant le rendu serveur) pour que
    // le premier rendu client corresponde au HTML serveur et évite un mismatch
    // d'hydratation ; le flag isLoading masque ce court instant "déconnecté".
    try {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      const storedUser = localStorage.getItem(USER_KEY);
      if (storedToken && storedUser) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch {
      // localStorage indisponible (navigation privée, etc.) — on ignore.
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    function handleUnauthorized() {
      setToken(null);
      setUser(null);
      try {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      } catch {
        // ignore
      }
      router.push("/connexion");
    }

    window.addEventListener("peci:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("peci:unauthorized", handleUnauthorized);
  }, [router]);

  const login = useCallback(async (email: string, password: string) => {
    const data = await api.post<LoginResponse>("/auth/login", { email, password });
    setToken(data.token);
    setUser(data.user);
    try {
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    } catch {
      // ignore
    }
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      if (token) {
        await api.post("/auth/logout", undefined, token);
      }
    } catch (error) {
      if (!(error instanceof ApiRequestError)) {
        throw error;
      }
    } finally {
      setToken(null);
      setUser(null);
      try {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      } catch {
        // ignore
      }
    }
  }, [token]);

  const value = useMemo(
    () => ({ user, token, isLoading, login, logout }),
    [user, token, isLoading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider.");
  }
  return context;
}
