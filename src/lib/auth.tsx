import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://rzmispdqrsvfhujslrbe.supabase.co",
  "eyJ...",
  {
    auth: {
      flowType: 'pkce',        // ← yeh add karo
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

Bug 3 — Auth Callback route nahi hai
src/routes/ mein auth.callback.tsx file banana hai:
tsximport { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/lib/auth";

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallback,
});

function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.exchangeCodeForSession(window.location.href)
      .then(({ data }) => {
        if (data.session) navigate({ to: "/", replace: true });
        else navigate({ to: "/login", replace: true });
      });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-slate-400">Logging you in...</p>
    </div>
  );
}

Supabase Dashboard mein bhi update karo
Authentication → URL Configuration:
Redirect URLs: http://localhost:5173/auth/callback
Production URL bhi wahan add karna agar deploy kiya hai.

Summary — 3 jagah changes:
FileChangesrc/lib/auth.tsxflowType: 'pkce' add karo + redirectTo fix karosrc/routes/auth.callback.tsxNai file banaoSupabase DashboardRedirect URL update karo
Yeh teeno changes karo — login loop khatam ho jayega!
);
export { supabase };

type User = { id: string; email: string; name?: string };

function getUserName(u: any): string | undefined {
  const meta = u?.user_metadata;
  const display = meta?.display_name || meta?.full_name || meta?.name;
  if (display) return display.split(" ")[0];
  const email = u?.email;
  if (email) return email.split("@")[0];
  return undefined;
}

type AuthContextType = {
  user: User | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user;
      if (u?.id && u?.email) {
        setUser({ id: u.id, email: u.email, name: getUserName(u) });
      }
      setReady(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user;
      if (u?.id && u?.email) {
        setUser({ id: u.id, email: u.email, name: getUserName(u) });
      } else {
        setUser(null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
  };

  const signup = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw new Error(error.message);
  };

  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/auth/callback",
        scopes: "https://www.googleapis.com/auth/gmail.readonly",
        queryParams: { access_type: "offline", prompt: "consent" },
      },
    });
    if (error) throw new Error(error.message);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, ready, login, signup, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
