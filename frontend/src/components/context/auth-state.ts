import { createContext } from "react";
import type { AuthUser } from "../../types/auth";

export type AuthState = {
  user: AuthUser | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  signup: (name: string, email: string, password: string) => Promise<AuthUser>;
  logout: () => void;
  updateUser: (user: AuthUser) => void;
};

export const AuthContext = createContext<AuthState | undefined>(undefined);