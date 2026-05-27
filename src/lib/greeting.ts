import type { Lang } from "@/types";

/** Greeting from the user's local clock (5–12 morning, 12–17 afternoon, 17–22 evening). */
export function getTimeGreeting(lang: Lang): string {
  const hour = new Date().getHours();

  if (lang === "th") {
    if (hour >= 5 && hour < 12) return "สวัสดีตอนเช้า";
    if (hour >= 12 && hour < 17) return "สวัสดียามบ่าย";
    if (hour >= 17 && hour < 22) return "สวัสดีตอนเย็น";
    return "สวัสดี";
  }

  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 17) return "Good afternoon";
  if (hour >= 17 && hour < 22) return "Good evening";
  return "Hello";
}
