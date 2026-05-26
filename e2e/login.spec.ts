import { expect, test, type Page } from "@playwright/test";

const signInButton = (page: Page) =>
  page.getByRole("button", { name: "เข้าสู่ระบบ", exact: true });

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

  test("shows validation when fields are empty", async ({ page }) => {
    await openLogin(page);
    await signInButton(page).click();
    await expect(page.getByText("กรุณากรอกข้อมูลให้ครบ")).toBeVisible();
  });

  test("manager can sign in and reach dashboard", async ({ page }) => {
    await openLogin(page);

    const employeeId = page.getByPlaceholder("เช่น EMP-0421");
    const password = page.getByPlaceholder("••••••••");

    await employeeId.fill("EMP-0421-M");
    await password.fill("manager123");
    await password.press("Enter");

    await page.waitForURL(/\/dashboard$/, { timeout: 15_000 });
    await expect(
      page.getByText(/สวัสดี|Good morning|Good afternoon|Good evening|Hello/).first(),
    ).toBeVisible();
  });

  test("protected routes redirect to login when signed out", async ({ page }) => {
    await page.addInitScript(() => {
      window.sessionStorage.clear();
    });
    await page.goto("/dashboard");
    await page.waitForURL(/\/login$/, { timeout: 15_000 });
  });
});
