import { apiUrl } from "@/lib/api/config";
import { readAuthRole } from "@/lib/auth-session";
import type { Role } from "@/types";

export type AiChatHistoryMessage = {
  role: "user" | "assistant";
  content: string;
};

export interface AiChatResponse {
  reply: string;
}

export async function askDonjai(
  message: string,
  role: Role,
  history: AiChatHistoryMessage[] = [],
): Promise<AiChatResponse> {
  const response = await fetch(apiUrl("/api/v1/ai/chat"), {
    method: "POST",
    headers: chatHeaders(role),
    body: JSON.stringify({ message, role, history }),
  });

  const data = (await response.json()) as { reply?: string; error?: string };

  if (!response.ok) {
    throw new Error(data.error ?? response.statusText);
  }

  if (!data.reply?.trim()) {
    throw new Error("AI service returned an empty reply");
  }

  return { reply: data.reply };
}

function chatHeaders(fallbackRole: Role): HeadersInit {
  const headers = new Headers({
    Accept: "application/json",
    "Content-Type": "application/json",
  });
  headers.set("X-User-Role", readAuthRole() ?? fallbackRole);
  return headers;
}
