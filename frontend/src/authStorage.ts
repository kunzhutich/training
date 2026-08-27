import type { AuthUser } from "./types";

const STORAGE_KEY = "bankapp.currentUser";

export function readStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function writeStoredUser(user: AuthUser | null): void {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // localStorage unavailable - session still works for this page load
  }
}

export function getToken(): string | null {
  return readStoredUser()?.access_token ?? null;
}

export const UNAUTHORIZED_EVENT = "bankapp:unauthorized";
