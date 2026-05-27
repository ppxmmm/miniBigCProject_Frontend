import { apiUrl } from "@/lib/api/config";
import { readAuthRole } from "@/lib/auth-session";
import type { Role } from "@/types";

const USER_ROLE_HEADER = "X-User-Role";

function buildHeaders(role?: Role | null, extra?: HeadersInit): HeadersInit {
  const headers = new Headers(extra);
  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }
  const resolvedRole = role ?? readAuthRole();
  if (resolvedRole) {
    headers.set(USER_ROLE_HEADER, resolvedRole);
  }
  return headers;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiGet<T>(path: string, role?: Role | null): Promise<T> {
  const response = await fetch(apiUrl(path), {
    method: "GET",
    headers: buildHeaders(role),
    headers: requestHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    let detail = response.statusText;
    try {
      const body = (await response.json()) as { error?: string };
      if (body.error) detail = body.error;
    } catch {
      /* ignore */
    }
    throw new ApiError(detail, response.status);
  }

  return response.json() as Promise<T>;
}

export async function apiPost<TResponse, TBody>(
  path: string,
  body: TBody,
  role?: Role | null,
): Promise<TResponse> {
  const response = await fetch(apiUrl(path), {
    method: "POST",
    headers: buildHeaders(role, { "Content-Type": "application/json" }),
    headers: requestHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!response.ok) {
    let detail = response.statusText;
    try {
      const responseBody = (await response.json()) as { error?: string };
      if (responseBody.error) detail = responseBody.error;
    } catch {
      /* ignore */
    }
    throw new ApiError(detail, response.status);
  }

  return response.json() as Promise<TResponse>;
}

function requestHeaders(extra?: HeadersInit): HeadersInit {
  const headers = new Headers(extra);
  headers.set("Accept", "application/json");

  const role = readAuthRole();
  if (role) {
    headers.set("X-User-Role", role);
  }

  return headers;
}
