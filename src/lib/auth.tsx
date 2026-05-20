import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const STORAGE_KEY = "jobtrack_auth_v1";
export const VALID_EMAIL = "mbmaryambashir1999@gmail.com";
export const VALID_PASSWORD = "Maryam@123";

type AuthContextValue = {
  isAuthenticated: boolean;
  login: (email: string, password: string, remember: boolean) => Promise<boolean>;
  logout: () => void;
  ready: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setAuth] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
      if (v === "1") setAuth(true);
    } catch {}
    setReady(true);
  }, []);

  const login = async (email: string, password: string, remember: boolean) => {
    await new Promise((r) => setTimeout(r, 700));
    if (email.trim().toLowerCase() === VALID_EMAIL && password === VALID_PASSWORD) {
      try {
        (remember ? localStorage : sessionStorage).setItem(STORAGE_KEY, "1");
      } catch {}
      setAuth(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {}
    setAuth(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, ready }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
