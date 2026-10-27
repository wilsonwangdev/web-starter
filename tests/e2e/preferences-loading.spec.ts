import { expect, test } from "playwright/test";

test.use({ locale: "en-US", colorScheme: "light" });

const preferencesChunk = "**/assets/PreferencesPanel-*.js";

test("preferences can close while loading without reopening when the chunk arrives", async ({
  page,
}) => {
  const gate: { release?: () => void } = {};
  const pending = new Promise<void>((resolve) => {
    gate.release = resolve;
  });
  await page.route(preferencesChunk, async (route) => {
    await pending;
    await route.continue();
  });

  try {
    await page.goto("/");
    const trigger = page.getByRole("button", { name: "Preferences", exact: true });
    const requested = page.waitForRequest(preferencesChunk);
    await trigger.click();
    await requested;
    const dialog = page.getByRole("dialog", { name: "Preferences", exact: true });
    await expect(dialog.getByRole("heading", { name: "Preferences", exact: true })).toBeVisible();
    await expect(dialog.getByRole("status")).toHaveText("Opening…");
    const close = dialog.getByRole("button", { name: "Close", exact: true });
    await expect(close).toBeEnabled();
    await close.click();
    await expect(dialog).not.toBeVisible();
    await expect(trigger).toBeFocused();

    const completed = page.waitForResponse(preferencesChunk);
    gate.release?.();
    await (await completed).finished();
    await expect(dialog).not.toBeVisible();
    await expect(trigger).toBeFocused();

    await trigger.click();
    await expect(dialog.getByRole("combobox", { name: "Density", exact: true })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
    await expect(trigger).toBeFocused();
  } finally {
    gate.release?.();
  }
});

test("a preferences chunk failure preserves the workspace and its draft", async ({ page }) => {
  await page.route(preferencesChunk, (route) => route.abort("failed"));
  await page.goto("/workspace");
  const draft = "A draft stays editable when preferences are unavailable.";
  const editor = page.getByRole("textbox", { name: "Ideas and notes", exact: true });
  await editor.fill(draft);
  const trigger = page.getByRole("button", { name: "Preferences", exact: true });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Preferences", exact: true });
  await expect(dialog.getByRole("status")).toContainText("Preferences could not load.");
  await expect(dialog.getByRole("button", { name: "Close", exact: true })).toBeEnabled();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await expect(page.getByRole("navigation", { name: "Main navigation" })).toBeVisible();
  await expect(editor).toHaveValue(draft);
  const continued = `${draft} I can keep writing.`;
  await editor.fill(continued);
  await expect(editor).toHaveValue(continued);
});
