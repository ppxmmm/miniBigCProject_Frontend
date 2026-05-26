import type { Role } from "@/types";

const STORAGE_KEY = "minibigc.auth.role";

export function readAuthRole(): Role | null {
  if (typeof window === "undefined") return null;
  const value = sessionStorage.getItem(STORAGE_KEY);
  if (value === "manager" || value === "staff") return value;
  return null;
}

export function writeAuthRole(role: Role): void {
  sessionStorage.setItem(STORAGE_KEY, role);
}

export function clearAuthRole(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}
