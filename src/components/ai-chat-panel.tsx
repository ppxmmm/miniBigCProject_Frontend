"use client";

import * as React from "react";
import { Send, Sparkles } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { sendAIChatMessage } from "@/lib/api/ai-chat";
import { getT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { Lang, Role } from "@/types";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

interface AIChatPanelProps {
  lang: Lang;
  role: Role;
}

export function AIChatPanel({ lang, role }: AIChatPanelProps) {
  const t = getT(lang).aiChat;
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const scrollAnchorRef = React.useRef<HTMLDivElement>(null);
  const visibleMessages = React.useMemo<ChatMessage[]>(
    () => [
      {
        id: "assistant-greeting",
        role: "assistant",
        content: t.greeting,
      },
      ...messages,
    ],
    [messages, t.greeting],
  );

  React.useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ block: "end" });
  }, [messages, isLoading]);

  const handleSubmit = React.useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const message = inputValue.trim();
      if (!message || isLoading) return;

      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: message,
      };

      setMessages((current) => [...current, userMessage]);
      setInputValue("");
      setErrorMessage(null);
      setIsLoading(true);

      try {
        const reply = await sendAIChatMessage(message, role);
        setMessages((current) => [
          ...current,
          {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            content: reply,
          },
        ]);
      } catch {
        setErrorMessage(t.error);
        setMessages((current) => [
          ...current,
          {
            id: `assistant-error-${Date.now()}`,
            role: "assistant",
            content: t.error,
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [inputValue, isLoading, role, t.error],
  );

  return (
    <Card className="h-full min-h-[520px] gap-0 rounded-xl border-border/80 py-0">
      <CardHeader className="border-b px-4 py-3">
        <div className="flex items-start gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Sparkles className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <CardTitle className="text-sm">{t.title}</CardTitle>
            <CardDescription className="text-xs">{t.subtitle}</CardDescription>
          </div>
          <Badge variant="secondary" className="h-6 text-[11px]">
            AI
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex min-h-0 flex-1 flex-col px-0">
        <div
          className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-3"
          aria-live="polite"
        >
          {visibleMessages.map((message) => {
            const isUser = message.role === "user";
            return (
              <div
                key={message.id}
                className={cn("flex", isUser ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[86%] rounded-xl px-3 py-2 text-sm leading-relaxed",
                    isUser
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground",
                  )}
                >
                  <div className="mb-1 text-[10px] font-medium uppercase tracking-normal opacity-70">
                    {isUser ? t.userLabel : t.assistantLabel}
                  </div>
                  <p className="whitespace-pre-wrap break-words">{message.content}</p>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex justify-start">
              <div className="rounded-xl bg-muted px-3 py-2 text-sm text-muted-foreground">
                {t.loading}
              </div>
            </div>
          )}
          <div ref={scrollAnchorRef} />
        </div>

        {errorMessage && (
          <div
            className="mx-4 mb-3 rounded-lg border border-destructive/25 bg-destructive/10 px-3 py-2 text-xs text-destructive"
            role="alert"
          >
            {errorMessage}
          </div>
        )}

        <form className="border-t p-3" onSubmit={handleSubmit}>
          <label className="sr-only" htmlFor="ai-chat-message">
            {t.inputLabel}
          </label>
          <div className="flex items-end gap-2">
            <textarea
              id="ai-chat-message"
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  event.currentTarget.form?.requestSubmit();
                }
              }}
              placeholder={t.placeholder}
              rows={2}
              className="max-h-28 min-h-10 flex-1 resize-none rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon-lg"
              aria-label={t.send}
              disabled={isLoading || !inputValue.trim()}
            >
              <Send className="size-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
