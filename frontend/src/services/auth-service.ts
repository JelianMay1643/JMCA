import api from "../lib/axios";
import type { AuthUser } from "../types/auth";

type AuthResponse = { token: string; user: AuthUser };

export const loginRequest = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  const res = await api.post("/api/auth/login", { email, password });
  return res.data;
};

export const signupRequest = async (
  name: string,
  email: string,
  password: string
): Promise<AuthResponse> => {
  const res = await api.post("/api/auth/signup", { name, email, password });
  return res.data;
};

export const getMe = async (): Promise<AuthUser> => {
  const res = await api.get("/api/auth/me");
  return res.data;
};

export const updateProfileRequest = async (name: string): Promise<AuthUser> => {
  const res = await api.patch("/api/auth/profile", { name });
  return res.data;
};

export const changePasswordRequest = async (
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  await api.patch("/api/auth/password", { currentPassword, newPassword });
};