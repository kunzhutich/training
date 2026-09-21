import { api } from "./client";
import type { Customer, CreateCustomerPayload, UpdateCustomerPayload } from "../types";

export const customersApi = {
  list: () => api.get<Customer[]>("/api/v1/customers"),
  get: (id: string) => api.get<Customer>(`/api/v1/customers/${id}`),
  create: (payload: CreateCustomerPayload) => api.post<Customer>("/api/v1/customers", payload),
  update: (id: string, payload: UpdateCustomerPayload) =>
    api.put<Customer>(`/api/v1/customers/${id}`, payload),
  updateUsername: (id: string, newUsername: string) =>
    api.put<Customer>(`/api/v1/customers/${id}/username`, { new_username: newUsername }),
  deactivate: (id: string) => api.delete<Customer>(`/api/v1/customers/${id}`),
  reactivate: (id: string) => api.post<Customer>(`/api/v1/customers/${id}/reactivate`, {}),
};
