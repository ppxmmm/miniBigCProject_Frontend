import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getTimeGreeting } from "@/lib/greeting";

describe("getTimeGreeting", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns morning greeting before noon", () => {
    vi.setSystemTime(new Date("2026-05-26T09:30:00"));
    expect(getTimeGreeting("en")).toBe("Good morning");
    expect(getTimeGreeting("th")).toBe("สวัสดีตอนเช้า");
  });

  it("returns afternoon greeting between 12:00 and 16:59", () => {
    vi.setSystemTime(new Date("2026-05-26T14:00:00"));
    expect(getTimeGreeting("en")).toBe("Good afternoon");
    expect(getTimeGreeting("th")).toBe("สวัสดียามบ่าย");
  });

  it("returns evening greeting between 17:00 and 21:59", () => {
    vi.setSystemTime(new Date("2026-05-26T19:00:00"));
    expect(getTimeGreeting("en")).toBe("Good evening");
    expect(getTimeGreeting("th")).toBe("สวัสดีตอนเย็น");
  });

  it("returns generic greeting late at night", () => {
    vi.setSystemTime(new Date("2026-05-26T23:30:00"));
    expect(getTimeGreeting("en")).toBe("Hello");
    expect(getTimeGreeting("th")).toBe("สวัสดี");
  });
});
