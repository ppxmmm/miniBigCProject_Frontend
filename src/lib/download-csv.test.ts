import { describe, expect, it } from "vitest";
import { toCsv } from "@/lib/download-csv";

describe("toCsv", () => {
  it("escapes commas and quotes", () => {
    expect(toCsv([["a", "b,c", 'd"e']])).toBe('a,"b,c","d""e"');
  });
});
