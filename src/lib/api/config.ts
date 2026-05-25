const API_PREFIX = "/api/v1";

/** Browser: use same-origin proxy. Server: use explicit backend URL when set. */
export function getApiBaseUrl(): string {
  if (typeof window === "undefined") {
    return (
      process.env.API_BASE_URL?.replace(/\/$/, "") ??
      process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
      "http://localhost:5001"
    );
  }

  const publicBase = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");
  return publicBase ?? "";
}

export function apiUrl(path: string): string {
  const base = getApiBaseUrl();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return base ? `${base}${normalized}` : normalized;
}

export { API_PREFIX };
