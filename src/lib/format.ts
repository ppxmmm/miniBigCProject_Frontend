import type { Lang } from "@/types";
import { I18N } from "@/lib/i18n";

export function fmtMoney(v: number, opts: { compact?: boolean; sign?: boolean } = {}): string {
  const { compact = false, sign = false } = opts;
  let s: string;
  if (compact && v >= 1e6) s = "฿" + (v / 1e6).toFixed(2) + "M";
  else if (compact && v >= 1e3) s = "฿" + (v / 1e3).toFixed(1) + "k";
  else s = "฿" + Math.round(v).toLocaleString("en-US");
  if (sign && v > 0) s = "+" + s;
  return s;
}

export function fmtNum(v: number): string {
  return Math.round(v).toLocaleString("en-US");
}

export function fmtPct(v: number, opts: { sign?: boolean; dp?: number } = {}): string {
  const { sign = false, dp = 1 } = opts;
  const s = (v * 100).toFixed(dp) + "%";
  return sign && v > 0 ? "+" + s : s;
}

export function fmtD(d: Date, lang: Lang = "th"): string {
  const m = I18N[lang].months[d.getMonth()];
  return `${d.getDate()} ${m}`;
}

// Anchor "today" to May 22, 2026 so the mock data feels current relative to the demo date.
export const TODAY = new Date(2026, 4, 22);

export function daysBetween(d: Date): number {
  return Math.round((d.getTime() - TODAY.getTime()) / (1000 * 60 * 60 * 24));
}

export function dPlus(n: number): Date {
  const d = new Date(TODAY);
  d.setDate(d.getDate() + n);
  return d;
}
