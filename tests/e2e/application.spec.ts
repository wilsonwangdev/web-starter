import { expect, test } from "playwright/test";
import { z } from "zod";
import { project } from "../../shared/project.ts";
import { appearanceStorageKey } from "../../shared/appearance.ts";

test.use({ locale: "en-US", colorScheme: "light" });

test("a draft survives navigation and a direct workspace refresh", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Start writing", exact: true }).click();
  await expect(page).toHaveURL(/\/workspace$/);
  await page.getByRole("textbox", { name: "Draft title", exact: true }).fill("A small next step");
  await page
    .getByRole("textbox", { name: "Ideas and notes", exact: true })
    .fill("Write one useful sentence.\n再写一句中文。");
  await expect(page.getByRole("status")).toContainText("Saved on this device");

  await page.reload();
  await expect(page.getByRole("textbox", { name: "Draft title", exact: true })).toHaveValue(
    "A small next step",
  );
  await expect(page.getByRole("textbox", { name: "Ideas and notes", exact: true })).toHaveValue(
    "Write one useful sentence.\n再写一句中文。",
  );
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Home", exact: true })
    .click();
  await page.getByRole("link", { name: "Continue my draft", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "Draft title", exact: true })).toHaveValue(
    "A small next step",
  );
  await page.goBack();
  await expect(page.getByRole("link", { name: "Continue my draft", exact: true })).toBeVisible();
});

test("page titles follow the route that is actually rendered", async ({ page }) => {
  for (const path of ["/workspace/", "/WORKSPACE"]) {
    await page.goto(path);
    await expect(page.getByRole("textbox", { name: "Draft title", exact: true })).toBeVisible();
    await expect(page).toHaveTitle(`Workspace · ${project.displayName}`);
  }
  await page.goto("/missing-route");
  await expect(
    page.getByRole("heading", { name: "Nothing here just yet.", exact: true }),
  ).toBeVisible();
  await expect(page).toHaveTitle(`Nothing here just yet. · ${project.displayName}`);
  await page.getByRole("link", { name: "Back to home", exact: true }).click();
  await expect(page).toHaveTitle(`Home · ${project.displayName}`);
});

test("preferences change the interface and survive a reload", async ({ page }) => {
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "Preferences", exact: true });
  await trigger.click();
  let dialog = page.getByRole("dialog", { name: "Preferences", exact: true });
  await dialog.getByRole("radio", { name: "Dark", exact: true }).check();
  await dialog.getByRole("radio", { name: "Moss", exact: true }).check();
  await dialog.getByRole("combobox", { name: "Density", exact: true }).click();
  await page.getByRole("option", { name: "Compact", exact: true }).click();
  await dialog.getByRole("radio", { name: "简体中文", exact: true }).check();
  dialog = page.getByRole("dialog", { name: "偏好设置", exact: true });
  await expect(dialog.getByRole("radio", { name: "暗色", exact: true })).toBeChecked();
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  await expect(page.locator("html")).toHaveAttribute("data-mode", "dark");
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(page.getByRole("button", { name: "偏好设置", exact: true })).toBeFocused();

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  await expect(page.locator("html")).toHaveAttribute("data-mode", "dark");
  await page.getByRole("button", { name: "偏好设置", exact: true }).click();
  dialog = page.getByRole("dialog", { name: "偏好设置", exact: true });
  await expect(dialog.getByRole("radio", { name: "苔绿", exact: true })).toBeChecked();
  await expect(dialog.getByRole("combobox", { name: "界面密度", exact: true })).toHaveText("紧凑");
  await dialog.getByRole("button", { name: "恢复默认偏好", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("html")).toHaveAttribute("data-mode", "light");
});

test("system appearance changes while the application is open", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-mode", "light");
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.locator("html")).toHaveAttribute("data-mode", "dark");
  await expect
    .poll(() => page.locator('meta[name="theme-color"]').getAttribute("content"))
    .toBeTruthy();
  const darkColor = await page.locator('meta[name="theme-color"]').getAttribute("content");
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator("html")).toHaveAttribute("data-mode", "light");
  await expect
    .poll(() => page.locator('meta[name="theme-color"]').getAttribute("content"))
    .not.toBe(darkColor);
});

test("keyboard focus remains visible in forced colors", async ({ page, browserName }) => {
  test.skip(browserName !== "chromium", "Forced-colors emulation requires Chromium.");
  await page.emulateMedia({ forcedColors: "active" });
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "Preferences", exact: true });
  await trigger.focus();
  await expect(trigger).toHaveCSS("outline-style", "solid");
  await trigger.press("Enter");
  const density = page.getByRole("combobox", { name: "Density", exact: true });
  await density.focus();
  await expect(density).toBeFocused();
  await expect(density).toHaveCSS("outline-style", "solid");
  await expect
    .poll(() =>
      density.evaluate((element) => Number.parseFloat(getComputedStyle(element).outlineWidth)),
    )
    .toBeGreaterThan(0);
});

test("the narrow layout keeps navigation, the editor and preferences within the viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto("/");
  const expectNoOverflow = async () => {
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth - innerWidth))
      .toBeLessThanOrEqual(1);
  };
  await expectNoOverflow();
  await page.getByRole("link", { name: "Start writing", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Draft title", exact: true })
    .fill("A very long unbroken title ".repeat(5));
  await page
    .getByRole("textbox", { name: "Ideas and notes", exact: true })
    .fill("long-unbroken-text".repeat(60));
  await expectNoOverflow();
  await page.getByRole("button", { name: "Preferences", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Preferences", exact: true });
  await expect(dialog).toBeVisible();
  await expectNoOverflow();
  await dialog.getByRole("radio", { name: "Dark", exact: true }).check();
  await dialog.getByRole("combobox", { name: "Density", exact: true }).click();
  await page.getByRole("option", { name: "Compact", exact: true }).click();
  await dialog.getByRole("button", { name: "Close", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "Ideas and notes", exact: true })).toBeVisible();
  await expectNoOverflow();
});

const manifestSchema = z.object({
  name: z.string(),
  description: z.string(),
  start_url: z.string(),
  scope: z.string(),
  display: z.string(),
  icons: z.array(
    z.object({ src: z.string(), sizes: z.string(), type: z.string(), purpose: z.string() }),
  ),
});

test("the built site serves an install manifest and correctly sized local icons", async ({
  page,
  request,
}) => {
  await page.goto("/");
  const manifestPath = await page.locator('link[rel="manifest"]').getAttribute("href");
  expect(manifestPath).toBeTruthy();
  if (!manifestPath) throw new Error("The application manifest link is missing.");
  const response = await request.get(manifestPath);
  expect(response.ok()).toBe(true);
  expect(response.headers()["content-type"]).toContain("application/manifest+json");
  const manifest = manifestSchema.parse(await response.json());
  expect(manifest).toMatchObject({
    name: project.displayName,
    description: project.description,
    start_url: "/",
    scope: "/",
    display: "standalone",
  });
  expect(manifest.icons.some((icon) => icon.purpose === "maskable")).toBe(true);
  for (const icon of manifest.icons) {
    expect(icon.src).toMatch(/^\/(?!\/)/);
    const asset = await request.get(icon.src);
    expect(asset.ok()).toBe(true);
    expect(asset.headers()["content-type"]).toContain("image/png");
    const png = await page.evaluate(async (source) => {
      const content = await (await fetch(source)).arrayBuffer();
      const view = new DataView(content);
      return {
        signature: [...new Uint8Array(content, 0, 8)],
        dimensions: `${view.getUint32(16)}x${view.getUint32(20)}`,
      };
    }, icon.src);
    expect(png.signature).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
    expect(png.dimensions).toBe(icon.sizes);
  }
  expect(
    await page.evaluate(async () => (await navigator.serviceWorker.getRegistrations()).length),
  ).toBe(0);
});

for (const scenario of [
  { saved: "dark", system: "light", expected: "dark" },
  { saved: "light", system: "dark", expected: "light" },
  { saved: "system", system: "dark", expected: "dark" },
  { saved: "unrecognized-mode", system: "dark", expected: "dark" },
] as const) {
  test(`appearance before the application loads: ${scenario.saved} with ${scenario.system} system`, async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: scenario.system });
    await page.addInitScript(({ key, value }) => localStorage.setItem(key, value), {
      key: appearanceStorageKey(project.storageNamespace),
      value: scenario.saved,
    });
    await page.route(/\/assets\/[^/]+\.js(?:\?.*)?$/, (route) => route.abort());
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("html")).toHaveAttribute("data-mode", scenario.expected);
    await expect(page.locator("#root")).toBeEmpty();
    expect(await page.evaluate(() => document.documentElement.style.colorScheme)).toBe(
      scenario.expected,
    );
  });
}

test("the first paint still follows the system when storage is blocked", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get: () => {
        throw new DOMException("Storage is unavailable", "SecurityError");
      },
    });
  });
  await page.route(/\/assets\/[^/]+\.js(?:\?.*)?$/, (route) => route.abort());
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("html")).toHaveAttribute("data-mode", "dark");
  await expect(page.locator("#root")).toBeEmpty();
});
