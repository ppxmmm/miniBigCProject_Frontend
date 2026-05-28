import { expect, test, type Page } from "@playwright/test";

const signInButton = (page: Page) =>
  page.getByRole("button", { name: "เข้าสู่ระบบ", exact: true });

const APP_URL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3001";

async function openLogin(page: Page) {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "ยินดีต้อนรับกลับ" })).toBeVisible();
}

test.describe("Login flow", () => {
  test("redirects home to login", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("heading", { name: "ยินดีต้อนรับกลับ" })).toBeVisible();
  });

  test("starts SSO login when clicking sign in", async ({ request }) => {
    const response = await request.get("/api/auth/login", { maxRedirects: 0 });
    expect(response.status()).toBeGreaterThanOrEqual(300);
    expect(response.status()).toBeLessThan(400);

    const location = response.headers()["location"] ?? "";
    expect(location).toContain("/authorize");
  });

  test("opens forgot password dialog and submits reset request", async ({ page }) => {
    await openLogin(page);

    await page.getByRole("button", { name: "ลืมรหัสผ่าน?" }).click();
    await expect(
      page.getByRole("heading", { name: "รีเซ็ตรหัสผ่าน" }),
    ).toBeVisible();

    await page.getByRole("button", { name: "ส่งคำขอรีเซ็ต" }).click();
    await expect(page.getByText("กรุณากรอกอีเมลหรือรหัสพนักงาน")).toBeVisible();

    await page.getByLabel("อีเมลหรือรหัสพนักงาน").fill("EMP-0421-M");
    await page.getByRole("button", { name: "ส่งคำขอรีเซ็ต" }).click();

    await expect(page.getByText("ส่งคำขอรีเซ็ตแล้ว")).toBeVisible();
    await expect(page.getByText("ต้องการความช่วยเหลือทันที?")).toBeVisible();
  });

  test("manager can sign in and reach dashboard", async ({ page }) => {
    // Navigate first so we can reliably scope cookies to a concrete URL.
    await openLogin(page);

    await page.context().addCookies([
      {
        name: "sso_role",
        value: "manager",
        url: page.url(),
      },
      {
        name: "sso_name",
        value: encodeURIComponent("Playwright Manager"),
        url: page.url(),
      },
      {
        name: "sso_email",
        value: encodeURIComponent("manager@example.com"),
        url: page.url(),
      },
      {
        name: "sso_sub",
        value: "playwright-manager",
        url: page.url(),
      },
    ]);

    await page.goto("/dashboard");
    await page.waitForURL(/\/dashboard$/, { timeout: 15_000 });
    await expect(
      page.getByText(/สวัสดี|Good morning|Good afternoon|Good evening|Hello/).first(),
    ).toBeVisible();
  });

  test("protected routes redirect to login when signed out", async ({ page }) => {
    await page.addInitScript(() => {
      window.sessionStorage.clear();
    });
    await page.context().clearCookies();
    await page.goto("/dashboard");
    await page.waitForURL(/\/login$/, { timeout: 15_000 });
  });
});
