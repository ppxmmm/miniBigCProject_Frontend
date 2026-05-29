import { apiPost } from "@/lib/api/client";
import type { Role } from "@/types";

export type AIChatHistoryMessage = {
  role: "user" | "assistant";
  content: string;
};

interface AIChatResponse {
  reply?: string;
}

export async function sendAIChatMessage(
  message: string,
  role: Role,
  history: AIChatHistoryMessage[] = [],
): Promise<string> {
  const response = await apiPost<
    AIChatResponse,
    { message: string; role: Role; history: AIChatHistoryMessage[] }
  >(
    "/api/ai/chat",
    { message, role, history },
    role,
  );

  if (!response.reply) {
    throw new Error("AI chat response did not include a reply.");
  }

  return response.reply;
}
