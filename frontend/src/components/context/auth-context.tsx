import { useEffect, useState, type ReactNode } from "react";
import type { AuthUser } from "../../types/auth";
import {
  getMe,
  loginRequest,
  signupRequest,
} from "../../services/auth-service";
import { clearToken, getToken, setToken } from "../../lib/auth-token";
import { AuthContext } from "./auth-state";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  
  const [loading, setLoading] = useState(() => getToken() !== null);

  useEffect(() => {
    if (!getToken()) return;
    getMe()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const res = await loginRequest(email, password);
    setToken(res.token);
    setUser(res.user);
    return res.user;
  };

  const signup = async (name: string, email: string, password: string) => {
    const res = await signupRequest(name, email, password);
    setToken(res.token);
    setUser(res.user);
    return res.user;
  };

  const logout = () => {
    clearToken();
    setUser(null);
  };

  const updateUser = (updated: AuthUser) => setUser(updated);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin: user?.role === "admin",
        login,
        signup,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}