import type { Role } from "@/types";

const STORAGE_KEY = "minibigc.auth.role";
const AUTH_ROLE_CHANGED_EVENT = "minibigc.auth.role.changed";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp("(?:^|; )" + name + "=([^;]*)"),
  );
  return match ? decodeURIComponent(match[1]) : null;
}

export function readAuthRole(): Role | null {
  if (typeof window === "undefined") return null;
  const cookieRole = getCookie("sso_role");
  if (cookieRole === "manager" || cookieRole === "staff") {
    sessionStorage.setItem(STORAGE_KEY, cookieRole);
    return cookieRole;
  }
  sessionStorage.removeItem(STORAGE_KEY);
  return null;
}

export function readSsoProfile(): {
  name?: string;
  email?: string;
  sub?: string;
} | null {
  const name = getCookie("sso_name") ?? undefined;
  const email = getCookie("sso_email") ?? undefined;
  const sub = getCookie("sso_sub") ?? undefined;
  if (!name && !email) return null;
  return { name, email, sub };
}

function notifyAuthRoleChanged(): void {
  window.dispatchEvent(new Event(AUTH_ROLE_CHANGED_EVENT));
}

export function writeAuthRole(role: Role): void {
  sessionStorage.setItem(STORAGE_KEY, role);
  notifyAuthRoleChanged();
}

export function clearSsoCookies(): void {
  if (typeof document === "undefined") return;
  const expired =
    "expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Strict";
  for (const name of ["sso_role", "sso_name", "sso_email", "sso_sub"]) {
    document.cookie = `${name}=; ${expired}`;
  }
}

export function clearAuthRole(): void {
  clearSsoCookies();
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
