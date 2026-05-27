"use client";

import * as React from "react";
import {
  X,
  Sparkles,
  Loader2,
  AlertCircle,
  ArrowUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppShell } from "@/components/layout/app-shell";
import { askDonjai } from "@/lib/api/chat";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  error?: boolean;
}

const SUGGESTED: Record<"th" | "en", string[]> = {
  th: [
    "สถานการณ์วันนี้เป็นยังไง",
    "ทำไม MTD ต่ำกว่าเป้า",
    "Top 3 action ตอนนี้ควรทำอะไร",
  ],
  en: [
    "What's today's situation?",
    "Why is MTD below target?",
    "Top 3 actions I should take",
  ],
};

const PRIMARY_GRADIENT =
  "linear-gradient(145deg, var(--primary) 0%, color-mix(in oklch, var(--primary) 80%, black) 100%)";

function renderRich(text: string) {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    const isBullet = /^\s*[-•*]\s/.test(line);
    const cleaned = isBullet ? line.replace(/^\s*[-•*]\s/, "") : line;
    const parts = cleaned.split(/(\*\*[^*]+\*\*)/g).map((p, j) =>
      /^\*\*[^*]+\*\*$/.test(p) ? (
        <strong key={j}>{p.slice(2, -2)}</strong>
      ) : (
        <React.Fragment key={j}>{p}</React.Fragment>
      ),
    );
    if (isBullet) {
      return (
        <div key={i} className={cn("flex gap-2", i > 0 && "mt-[3px]")}>
          <span className="shrink-0 text-muted-foreground">•</span>
          <span>{parts}</span>
        </div>
      );
    }
    return (
      <div key={i} className={cn(i > 0 && "mt-[3px]")}>
        {parts}
      </div>
    );
  });
}

function AssistantAvatar() {
  return (
    <div
      className="flex size-[26px] shrink-0 items-center justify-center rounded-[7px] text-white"
      style={{ background: PRIMARY_GRADIENT }}
    >
      <Sparkles className="size-3.5" />
    </div>
  );
}

function formatChatError(message: string, isTh: boolean): string {
  if (message.includes("GEMINI_API_KEY")) {
    return isTh
      ? "เซิร์ฟเวอร์ยังไม่ได้ตั้งค่า GEMINI_API_KEY ในไฟล์ .env ของ backend — ให้เพิ่น API key จาก Google AI Studio แล้วรีสตาร์ท Go server"
      : "Backend is missing GEMINI_API_KEY in .env — add your Google AI Studio key and restart the Go server.";
  }
  if (message.includes("AI service unavailable")) {
    return isTh
      ? "บริการ AI ไม่พร้อมใช้งานชั่วคราว กรุณาลองใหม่ภายหลัง"
      : "AI service is temporarily unavailable. Please try again later.";
  }
  if (message.toLowerCase().includes("fetch") || message.includes("Failed to fetch")) {
    return isTh
      ? "เชื่อมต่อ backend ไม่ได้ — ตรวจสอบว่า Go server รันอยู่ที่พอร์ต 5001"
      : "Cannot reach the backend — make sure the Go server is running on port 5001.";
  }
  return message;
}

function ChatPanel({ onClose }: { onClose: () => void }) {
  const { lang, role } = useAppShell();
  const isTh = lang === "th";

  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  React.useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 80);
    return () => clearTimeout(t);
  }, []);

  const sendMessage = React.useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      const userMsg: ChatMessage = {
        id: `u-${Date.now()}`,
        role: "user",
        content: trimmed,
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setLoading(true);

      try {
        const { reply } = await askDonjai(trimmed, role);
        setMessages((prev) => [
          ...prev,
          {
            id: `a-${Date.now()}`,
            role: "assistant",
            content: reply,
          },
        ]);
      } catch (err) {
        const raw =
          err instanceof Error ? err.message : isTh ? "เกิดข้อผิดพลาด" : "Something went wrong";
        setMessages((prev) => [
          ...prev,
          {
            id: `e-${Date.now()}`,
            role: "assistant",
            content: formatChatError(raw, isTh),
            error: true,
          },
        ]);
      } finally {
        setLoading(false);
        inputRef.current?.focus();
      }
    },
    [loading, role, isTh],
  );

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage(input);
      }
    },
    [input, sendMessage],
  );

  const greeting = isTh
    ? `สวัสดีครับ ผม Donjai — ผู้ช่วย AI ของ BigC ลองถามได้ครับ`
    : `Hi! I'm Donjai — your BigC AI assistant. Ask anything about your branch.`;

  const isEmpty = messages.length === 0;
  const suggested = SUGGESTED[lang];

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-t-2xl border border-border bg-card shadow-[0_18px_50px_-10px_rgba(0,0,0,0.28),0_6px_14px_-4px_rgba(0,0,0,0.12)] sm:rounded-2xl">
      <div
        className="flex shrink-0 items-center gap-3 px-4 py-3.5 text-white"
        style={{ background: PRIMARY_GRADIENT }}
      >
        <div className="flex size-9 items-center justify-center rounded-[10px] bg-white/20 backdrop-blur-sm">
          <Sparkles className="size-[18px]" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[14.5px] font-semibold tracking-tight">
              Donjai
            </span>
            <span className="rounded bg-white/20 px-1.5 py-[2px] text-[9.5px] font-bold uppercase tracking-[0.08em]">
              AI
            </span>
          </div>
          <div className="mt-[2px] flex items-center gap-1.5 text-[11px] opacity-85">
            <span
              className="size-1.5 rounded-full"
              style={{ background: "#7be0a8", boxShadow: "0 0 6px #7be0a8" }}
            />
            {isTh
              ? "พร้อมช่วย · ใช้ข้อมูล Dashboard ของคุณ"
              : "Ready · grounded in your dashboard"}
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={isTh ? "ปิด" : "Close"}
          className="inline-flex size-7 items-center justify-center rounded-[7px] bg-white/15 text-white transition-colors hover:bg-white/30"
        >
          <X className="size-3.5" />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto overscroll-contain bg-background px-3.5 py-4">
        <div className="flex items-start gap-2">
          <AssistantAvatar />
          <div className="max-w-[min(78%,20rem)] rounded-[12px_12px_12px_4px] border border-border bg-card px-3 py-[9px] text-[13px] leading-[1.5] text-foreground">
            {renderRich(greeting)}
          </div>
        </div>

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex items-start gap-2",
              msg.role === "user" ? "flex-row-reverse" : "flex-row",
            )}
          >
            {msg.role === "assistant" && <AssistantAvatar />}
            <div
              className={cn(
                "max-w-[min(78%,20rem)] px-3 py-[9px] text-[13px] leading-[1.5] break-words",
                msg.role === "user"
                  ? "rounded-[12px_12px_4px_12px] bg-primary text-primary-foreground"
                  : msg.error
                    ? "rounded-[12px_12px_12px_4px] border border-destructive/30 bg-destructive/10 text-destructive"
                    : "rounded-[12px_12px_12px_4px] border border-border bg-card text-foreground",
              )}
            >
              {msg.error && (
                <AlertCircle className="mb-1 size-3.5 opacity-70" />
              )}
              {msg.role === "assistant" && !msg.error ? (
                renderRich(msg.content)
              ) : (
                <span className="whitespace-pre-wrap">{msg.content}</span>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-start gap-2">
            <AssistantAvatar />
            <div className="flex items-center gap-1 rounded-[12px_12px_12px_4px] border border-border bg-card px-3.5 py-[10px]">
              <span className="chat-dot" />
              <span className="chat-dot" style={{ animationDelay: "0.15s" }} />
              <span className="chat-dot" style={{ animationDelay: "0.3s" }} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {isEmpty && !loading && (
        <div className="flex shrink-0 flex-wrap gap-1.5 border-t border-border bg-card px-3.5 pb-1 pt-2">
          {suggested.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => sendMessage(s)}
              className="rounded-full border px-2.5 py-1.5 text-[11.5px] font-medium transition-colors hover:opacity-80"
              style={{
                background: "var(--primary-50)",
                color: "var(--primary)",
                borderColor:
                  "color-mix(in oklch, var(--primary) 25%, transparent)",
              }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div
        className={cn(
          "flex shrink-0 items-end gap-2 bg-card px-3 pt-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom,0px))] sm:pb-2.5",
          (!isEmpty || loading) && "border-t border-border",
        )}
      >
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            e.target.style.height = "auto";
            e.target.style.height =
              Math.min(80, e.target.scrollHeight) + "px";
          }}
          onKeyDown={handleKeyDown}
          placeholder={
            isTh
              ? "พิมพ์คำถาม… (Enter เพื่อส่ง)"
              : "Type your question… (Enter to send)"
          }
          rows={1}
          disabled={loading}
          className="max-h-20 min-h-[36px] flex-1 resize-none rounded-[9px] border border-border bg-background px-2.5 py-2 text-[13px] leading-[1.4] outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30"
        />
        <button
          type="button"
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || loading}
          aria-label={isTh ? "ส่ง" : "Send"}
          className={cn(
            "inline-flex size-9 shrink-0 items-center justify-center rounded-[9px] transition-opacity",
            !input.trim() || loading
              ? "bg-muted text-muted-foreground"
              : "bg-primary text-primary-foreground hover:opacity-90",
          )}
        >
          {loading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <ArrowUp className="size-4" />
          )}
        </button>
      </div>

      <div className="shrink-0 border-t border-border bg-card px-3 pb-2 pt-1 text-center text-[10.5px] text-muted-foreground">
        {isTh
          ? "ข้อมูลอ้างอิงจาก Dashboard · อาจมีข้อผิดพลาด ตรวจสอบก่อนตัดสินใจ"
          : "Grounded in dashboard data · May make mistakes — verify before deciding"}
      </div>
    </div>
  );
}

export function ChatWidget() {
  const [open, setOpen] = React.useState(false);
  const { lang } = useAppShell();
  const isTh = lang === "th";

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px] sm:bg-black/20 sm:backdrop-blur-none"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      <div
        className={cn(
          "fixed z-50 flex flex-col transition-[transform,opacity] duration-200 ease-out",
          "inset-x-0 bottom-0 w-full sm:inset-x-auto sm:right-[max(1.375rem,env(safe-area-inset-right,0px))] sm:left-auto sm:w-[min(24rem,calc(100vw-2rem))] sm:bottom-[calc(5.625rem+env(safe-area-inset-bottom,0px))]",
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none translate-y-4 opacity-0",
          open
            ? "h-[calc(100dvh-env(safe-area-inset-bottom,0px))] max-h-[100dvh] sm:h-[min(35rem,calc(100dvh-8rem))] sm:max-h-[calc(100dvh-8rem)]"
            : "h-0 overflow-hidden",
        )}
        role="dialog"
        aria-modal={open}
        aria-hidden={!open}
        aria-label={isTh ? "แชท AI Donjai" : "Donjai AI chat"}
      >
        {open && <ChatPanel onClose={() => setOpen(false)} />}
      </div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={isTh ? "เปิดแชท AI" : "Open AI chat"}
        aria-expanded={open}
        className={cn(
          "fixed z-50 flex size-14 items-center justify-center rounded-full transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none",
          "bottom-[calc(1.375rem+env(safe-area-inset-bottom,0px))] right-[calc(1.375rem+env(safe-area-inset-right,0px))]",
          open &&
            "max-sm:pointer-events-none max-sm:scale-0 max-sm:opacity-0 sm:scale-90 sm:border sm:border-border sm:bg-card sm:text-foreground sm:opacity-100 sm:shadow-[0_4px_14px_-2px_rgba(0,0,0,0.18)] sm:hover:scale-95",
          !open &&
            "text-white shadow-[0_8px_24px_-4px_color-mix(in_oklch,var(--primary)_55%,transparent),0_2px_6px_rgba(0,0,0,0.15)] hover:scale-105 active:scale-95",
        )}
        style={open ? undefined : { background: PRIMARY_GRADIENT }}
      >
        {open ? (
          <X className="size-5" />
        ) : (
          <span className="relative flex">
            <Sparkles className="size-6" />
            <span
              className="absolute -right-[3px] -top-[2px] size-[9px] rounded-full bg-white"
              style={{
                border:
                  "2px solid color-mix(in oklch, var(--primary) 80%, black)",
              }}
            />
          </span>
        )}
      </button>
    </>
  );
}
