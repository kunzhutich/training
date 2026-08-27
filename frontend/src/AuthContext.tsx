import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { authApi } from "./api/auth";
import { readStoredUser, writeStoredUser, UNAUTHORIZED_EVENT } from "./authStorage";
import type { AuthUser, LoginPayload } from "./types";

interface AuthContextValue {
  user: AuthUser | null;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
  updateProfile: (patch: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser());

  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      writeStoredUser(null);
    };
    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
  }, []);

  const login = async (payload: LoginPayload) => {
    const loggedInUser = await authApi.login(payload);
    setUser(loggedInUser);
    writeStoredUser(loggedInUser);
  };

  const logout = () => {
    setUser(null);
    writeStoredUser(null);
  };

  const updateProfile = (patch: Partial<AuthUser>) => {
    setUser((current) => {
      if (!current) return current;
      const updated = { ...current, ...patch };
      writeStoredUser(updated);
      return updated;
    });
  };

  const value = useMemo(() => ({ user, login, logout, updateProfile }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
