import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function POST() {
  const cookieStore = await cookies();
  const cookieNames = [
    "sso_access_token",
    "sso_refresh_token",
    "sso_role",
    "sso_name",
    "sso_email",
    "sso_sub",
  ];
  for (const name of cookieNames) {
    cookieStore.delete(name);
  }
  return NextResponse.redirect(new URL("/login", APP_URL).toString());
}
