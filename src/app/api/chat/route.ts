import { NextRequest } from "next/server";

const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "ANTHROPIC_API_KEY is not configured. Please add it to .env.local" },
      { status: 500 },
    );
  }

  let body: { messages: Array<{ role: string; content: string }>; systemContext?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { messages, systemContext } = body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: "messages array is required" }, { status: 400 });
  }

  const systemPrompt = [
    "You are Donjai (ดนัย), an AI assistant built into the Mini BigC Manager Console.",
    "You help retail store managers analyze branch performance, track inventory, manage deliveries, and solve operational problems.",
    "Be concise, practical, and action-oriented. Avoid long preambles.",
    "If the user writes in Thai, always respond in Thai. If in English, respond in English.",
    systemContext
      ? `\nCurrent branch snapshot (live data from the dashboard):\n${systemContext}`
      : "\nNo branch data is available in this session.",
  ]
    .filter(Boolean)
    .join("\n");

  const claudeRes = await fetch(CLAUDE_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    }),
  });

  if (!claudeRes.ok) {
    const errText = await claudeRes.text();
    let errMsg = `Claude API error (${claudeRes.status})`;
    try {
      const errJson = JSON.parse(errText);
      errMsg = errJson?.error?.message ?? errMsg;
    } catch {
      // keep default
    }
    return Response.json({ error: errMsg }, { status: claudeRes.status });
  }

  const data = await claudeRes.json();
  const content: string = data?.content?.[0]?.text ?? "";
  return Response.json({ content });
}
