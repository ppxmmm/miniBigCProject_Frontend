import { NextResponse } from "next/server";
import { verifyCredentials } from "@/lib/mock/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body ?? {};
    if (!email || !password) {
      return NextResponse.json({ message: "Missing credentials" }, { status: 400 });
    }

    const session = verifyCredentials(String(email), String(password));
    if (!session) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
    }

    // Simulate small delay for demo
    await new Promise((r) => setTimeout(r, 250));

    return NextResponse.json({ ok: true, user: session });
  } catch (err) {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }
}
