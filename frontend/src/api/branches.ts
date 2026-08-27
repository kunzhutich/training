import { api } from "./client";
import type { Branch, CreateBranchPayload } from "../types";

export const branchesApi = {
  list: () => api.get<Branch[]>("/api/v1/branches"),
  create: (payload: CreateBranchPayload) => api.post<Branch>("/api/v1/branches", payload),
};
