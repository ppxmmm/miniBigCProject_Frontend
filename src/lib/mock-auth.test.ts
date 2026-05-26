import { describe, expect, it } from "vitest";
import { authenticateMockEmployee } from "@/lib/mock-auth";

describe("authenticateMockEmployee", () => {
  it("accepts valid manager credentials", () => {
    const account = authenticateMockEmployee("EMP-0421-M", "manager123");
    expect(account?.role).toBe("manager");
  });

  it("accepts valid staff credentials", () => {
    const account = authenticateMockEmployee("EMP-0421-S", "staff123");
    expect(account?.role).toBe("staff");
  });

  it("normalizes employee id casing and whitespace", () => {
    const account = authenticateMockEmployee("  emp-0421-m  ", "manager123");
    expect(account?.role).toBe("manager");
  });

  it("rejects invalid password", () => {
    expect(authenticateMockEmployee("EMP-0421-M", "wrong")).toBeNull();
  });

  it("rejects unknown employee id", () => {
    expect(authenticateMockEmployee("EMP-9999-X", "manager123")).toBeNull();
  });
});
