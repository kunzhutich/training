import { api } from "./client";
import type { AuthUser, ChangePasswordPayload, LoginPayload } from "../types";

export const authApi = {
  login: (payload: LoginPayload) => api.post<AuthUser>("/api/v1/auth/login", payload),
  changePassword: (payload: ChangePasswordPayload) =>
    api.post<void>("/api/v1/auth/change-password", payload),
};
