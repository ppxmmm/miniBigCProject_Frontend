import { apiUrl } from "@/lib/api/config";
import type { Role } from "@/types";

export interface AiChatResponse {
  reply: string;
}

export async function askDonjai(
  message: string,
  role: Role,
): Promise<AiChatResponse> {
  const response = await fetch(apiUrl("/api/v1/ai/chat"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, role }),
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
