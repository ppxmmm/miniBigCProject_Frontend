import { apiPost } from "@/lib/api/client";
import type { Role } from "@/types";

interface AIChatResponse {
  reply?: string;
}

export async function sendAIChatMessage(
  message: string,
  role: Role,
): Promise<string> {
  const response = await apiPost<AIChatResponse, { message: string; role: Role }>(
    "/api/ai/chat",
    { message, role },
    role,
  );

  if (!response.reply) {
    throw new Error("AI chat response did not include a reply.");
  }

  return response.reply;
}
