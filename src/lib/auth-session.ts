import type { Role } from "@/types";

const STORAGE_KEY = "minibigc.auth.role";
const AUTH_ROLE_CHANGED_EVENT = "minibigc.auth.role.changed";

export function readAuthRole(): Role | null {
  if (typeof window === "undefined") return null;
  const value = sessionStorage.getItem(STORAGE_KEY);
  if (value === "manager" || value === "staff") return value;
  return null;
}

function notifyAuthRoleChanged(): void {
  window.dispatchEvent(new Event(AUTH_ROLE_CHANGED_EVENT));
}

export function writeAuthRole(role: Role): void {
  sessionStorage.setItem(STORAGE_KEY, role);
  notifyAuthRoleChanged();
}

export function clearAuthRole(): void {
  sessionStorage.removeItem(STORAGE_KEY);
  notifyAuthRoleChanged();
}

export function subscribeAuthRole(listener: () => void): () => void {
  window.addEventListener("storage", listener);
  window.addEventListener(AUTH_ROLE_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener(AUTH_ROLE_CHANGED_EVENT, listener);
  };
}
