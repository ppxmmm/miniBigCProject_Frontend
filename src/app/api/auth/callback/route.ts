import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const SSO_URL = process.env.NEXT_PUBLIC_SSO_URL ?? "http://localhost:8080";
const CLIENT_ID = process.env.NEXT_PUBLIC_SSO_CLIENT_ID ?? "minibigc";
const CLIENT_SECRET = process.env.SSO_CLIENT_SECRET ?? "";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const REDIRECT_URI = `${APP_URL}/api/auth/callback`;

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
}

interface UserInfoResponse {
  sub?: string;
  name?: string;
  email?: string;
  role?: string;
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(Buffer.from(payload, "base64").toString("utf8"));
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const loginUrl = new URL("/login", APP_URL);

  if (error) {
    loginUrl.searchParams.set("error", error);
    return NextResponse.redirect(loginUrl.toString());
  }

  if (!code || !state) {
    loginUrl.searchParams.set("error", "missing_params");
    return NextResponse.redirect(loginUrl.toString());
  }

  const cookieStore = await cookies();
  const savedState = cookieStore.get("sso_state")?.value;
  const codeVerifier = cookieStore.get("sso_pkce")?.value;

  cookieStore.delete("sso_state");
  cookieStore.delete("sso_pkce");

  if (!savedState || state !== savedState || !codeVerifier) {
    loginUrl.searchParams.set("error", "state_mismatch");
    return NextResponse.redirect(loginUrl.toString());
  }

  // Exchange authorization code for tokens
  const tokenBody = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: REDIRECT_URI,
    code_verifier: codeVerifier,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  });

  const tokenRes = await fetch(`${SSO_URL}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: tokenBody.toString(),
  });

  if (!tokenRes.ok) {
    loginUrl.searchParams.set("error", "token_exchange_failed");
    return NextResponse.redirect(loginUrl.toString());
  }

  const tokenData = (await tokenRes.json()) as TokenResponse;
  const payload = decodeJwtPayload(tokenData.access_token);
  const sub = (payload?.sub as string) ?? "";
  const expiresIn = tokenData.expires_in ?? 3600;

  // Fetch user profile from SSO
  let name = "";
  let email = "";
  let role: string = "staff";
  const userInfoRes = await fetch(`${SSO_URL}/userinfo`, {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  if (userInfoRes.ok) {
    const userInfo = (await userInfoRes.json()) as UserInfoResponse;
    name = userInfo.name ?? "";
    email = userInfo.email ?? "";
    if (userInfo.role === "manager" || userInfo.role === "staff") {
      role = userInfo.role;
    }
  }

  // Set httpOnly token cookies
  const tokenCookieOpts = {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: expiresIn,
  };
  cookieStore.set("sso_access_token", tokenData.access_token, tokenCookieOpts);
  if (tokenData.refresh_token) {
    cookieStore.set("sso_refresh_token", tokenData.refresh_token, {
      ...tokenCookieOpts,
      maxAge: 7 * 24 * 3600,
    });
  }

  // Set readable cookies for client-side use (role, profile)
  // maxAge matches refresh token so session persists across browser restarts
  const clientCookieOpts = {
    httpOnly: false,
    sameSite: "strict" as const,
    path: "/",
    maxAge: 7 * 24 * 3600,
  };
  cookieStore.set("sso_role", role, clientCookieOpts);
  cookieStore.set("sso_name", name, clientCookieOpts);
  cookieStore.set("sso_email", email, clientCookieOpts);
  cookieStore.set("sso_sub", sub, clientCookieOpts);

  return NextResponse.redirect(new URL("/dashboard", APP_URL).toString());
}
