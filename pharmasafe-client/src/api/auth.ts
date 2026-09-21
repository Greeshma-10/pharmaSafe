import { apiClient } from "./client";
import type { LoginInput, RegisterInput, AuthResponse } from "../types";

export const login = async (input: LoginInput): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>("/auth/login", input);
  return response.data;
};

export const register = async (input: RegisterInput): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>("/auth/register", input);
  return response.data;
};