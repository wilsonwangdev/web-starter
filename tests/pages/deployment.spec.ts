import { expect, test } from "playwright/test";
import { z } from "zod";

test.use({ locale: "en-US", colorScheme: "light" });

test("a project-path build supports direct hash routes, refresh, preferences and install assets", async ({
  page,
  request,
}) => {
  const failedRequests: string[] = [];
  page.on("response", (response) => {
    if (response.status() >= 400) failedRequests.push(response.url());
  });
  await page.goto("/example/#/workspace");
  const editor = page.getByRole("textbox", { name: "Ideas and notes", exact: true });
  await editor.fill("A project-path draft survives refresh.");
  await page.reload();
  await expect(editor).toHaveValue("A project-path draft survives refresh.");
  await page.getByRole("link", { name: "Skip to content", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("main")).toBeFocused();
  await expect(page).toHaveURL(/\/example\/#\/workspace$/);
  await page.getByRole("button", { name: "Preferences", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Preferences", exact: true });
  await dialog.getByRole("radio", { name: "Dark", exact: true }).check();
  await dialog.getByRole("radio", { name: "简体中文", exact: true }).check();
  await page.keyboard.press("Escape");
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  await expect(page.locator("html")).toHaveAttribute("data-mode", "dark");
  await page.getByRole("navigation").getByRole("link", { name: "首页", exact: true }).click();
  await expect(page).toHaveURL(/\/example\/#\/$/);
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  await expect(page.locator("html")).toHaveAttribute("data-mode", "dark");
  const manifestPath = await page.locator('link[rel="manifest"]').getAttribute("href");
  expect(manifestPath).toBe("/example/manifest.webmanifest");
  const response = await request.get("/example/manifest.webmanifest");
  expect(response.headers()["content-type"]).toContain("application/manifest+json");
  const manifest = z
    .object({
      id: z.string(),
      start_url: z.string(),
      scope: z.string(),
      icons: z.array(z.object({ src: z.string() })),
    })
    .parse(await response.json());
  expect(manifest).toMatchObject({ id: "/example/", start_url: "/example/", scope: "/example/" });
  for (const icon of manifest.icons) {
    expect(icon.src).toMatch(/^\/example\//);
    expect((await request.get(icon.src)).ok()).toBe(true);
  }
  expect(failedRequests).toEqual([]);
});
