import { expect, test } from "playwright/test";
import { appearanceStorageKey } from "../../shared/appearance.ts";
import { project } from "../../shared/project.ts";
import { en } from "../../src/i18n/locales/en.ts";
import { zhCN } from "../../src/i18n/locales/zh-CN.ts";

test.use({ locale: "en-US", colorScheme: "light" });

test("the initial HTML renders a themed skeleton before the application arrives and hands off immediately", async ({
  page,
}) => {
  const gate: { release?: () => void } = {};
  const held = new Promise<void>((resolve) => {
    gate.release = resolve;
  });
  await page.addInitScript(({ key }) => localStorage.setItem(key, "dark"), {
    key: appearanceStorageKey(project.storageNamespace),
  });
  await page.route("**/assets/main-*.js", async (route) => {
    await held;
    await route.continue();
  });
  try {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const skeleton = page.getByRole("main", { name: en.startup.loading, exact: true });
    await expect(skeleton).toBeVisible();
    await expect(skeleton).toHaveAttribute("aria-busy", "true");
    await expect(page.locator("html")).toHaveAttribute("data-mode", "dark");
    await expect(page.locator(".startup-block").first()).toHaveCSS(
      "animation-name",
      "startup-breathe",
    );
    await expect(skeleton).not.toContainText(project.tagline);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
      true,
    );
    await page.screenshot({ path: test.info().outputPath("startup-skeleton-dark.png") });
    gate.release?.();
    await expect(page.getByRole("link", { name: en.home.start, exact: true })).toBeVisible();
    await expect(skeleton).toHaveCount(0);
    await expect(page.locator("[data-startup-error]")).toBeHidden();
    await page.reload();
    await expect(page.getByRole("link", { name: en.home.start, exact: true })).toBeVisible();
    await expect(page.locator("[data-startup-shell]")).toHaveCount(0);
  } finally {
    gate.release?.();
  }
});

test("the pre-React skeleton is static when reduced motion is requested", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const gate: { release?: () => void } = {};
  const held = new Promise<void>((resolve) => {
    gate.release = resolve;
  });
  await page.route("**/assets/main-*.js", async (route) => {
    await held;
    await route.continue();
  });
  try {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("[data-startup-shell]")).toBeVisible();
    await expect(page.locator(".startup-block").first()).toHaveCSS("animation-name", "none");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
      true,
    );
    gate.release?.();
    await expect(page.getByRole("link", { name: en.home.start, exact: true })).toBeVisible();
  } finally {
    gate.release?.();
  }
});

test("a failed application chunk provides an explicit reload without clearing the saved draft", async ({
  page,
}) => {
  const saved = JSON.stringify({
    version: 1,
    title: "Keep this draft",
    body: "Content remains on this device",
    updatedAt: new Date().toISOString(),
  });
  const draftKey = `${project.storageNamespace}-draft-v1`;
  await page.addInitScript(({ key, value }) => localStorage.setItem(key, value), {
    key: draftKey,
    value: saved,
  });
  let unavailable = true;
  await page.route("**/assets/main-*.js", (route) =>
    unavailable ? route.abort("failed") : route.continue(),
  );
  await page.goto("/workspace", { waitUntil: "domcontentloaded" });
  const recovery = page.getByRole("alert");
  await expect(
    recovery.getByRole("heading", { name: en.startup.title, exact: true }),
  ).toBeVisible();
  await expect(page.locator("#root")).toBeHidden();
  const reload = recovery.getByRole("button", { name: en.startup.reload, exact: true });
  expect(await page.evaluate((key) => localStorage.getItem(key), draftKey)).toBe(saved);
  unavailable = false;
  await reload.click();
  await expect(page.getByRole("textbox", { name: en.workspace.body, exact: true })).toBeVisible();
  await expect(page).toHaveURL(/\/workspace$/);
  await expect(page.getByRole("textbox", { name: en.workspace.body, exact: true })).toHaveValue(
    "Content remains on this device",
  );
});

test("an unavailable bootstrap module also exposes the HTML recovery path", async ({ page }) => {
  await page.route("**/assets/index-*.js", (route) =>
    route.fulfill({ status: 404, contentType: "text/javascript", body: "" }),
  );
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: en.startup.title, exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: en.startup.reload, exact: true })).toBeEnabled();
  await expect(page.locator("#root")).toBeHidden();
});

test("JavaScript-disabled navigation gives instructions instead of a permanent loading animation", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    ...(baseURL ? { baseURL } : {}),
  });
  try {
    const page = await context.newPage();
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: zhCN.startup.noScriptTitle, exact: true }),
    ).toBeVisible();
    await expect(page.locator("[data-startup-shell]")).toBeHidden();
    await expect(page.locator("[data-startup-error]")).toBeHidden();
  } finally {
    await context.close();
  }
});

test("forced colors keep skeleton shapes visible before the application loads", async ({
  page,
  browserName,
}) => {
  test.skip(browserName !== "chromium", "Forced-colors emulation requires Chromium.");
  await page.emulateMedia({ forcedColors: "active" });
  const gate: { release?: () => void } = {};
  const held = new Promise<void>((resolve) => {
    gate.release = resolve;
  });
  await page.route("**/assets/main-*.js", async (route) => {
    await held;
    await route.continue();
  });
  try {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const shape = page.locator(".startup-block").first();
    await expect(shape).toHaveCSS("border-style", "solid");
    await expect(shape).toHaveCSS("border-width", "1px");
    gate.release?.();
  } finally {
    gate.release?.();
  }
});
