import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { cleanup, render } from "vitest-browser-react";
import { createMemoryRouter, RouterProvider } from "react-router";
import App from "../../src/App";
import { draftStorageKey } from "../../src/draft";
import { AppProviders } from "../../src/preferences/Providers";
import { modeStorageKey, preferenceStorageKey } from "../../src/preferences/model";
import "../../src/index.css";

const viewport = { width: window.innerWidth, height: window.innerHeight };

beforeEach(() => {
  localStorage.clear();
});

afterEach(async () => {
  await cleanup();
  vi.restoreAllMocks();
  localStorage.clear();
  await page.viewport(viewport.width, viewport.height);
});

function mount(path = "/") {
  const router = createMemoryRouter([{ path: "*", element: <App /> }], { initialEntries: [path] });
  return render(
    <AppProviders initialLocale="zh-CN">
      <RouterProvider router={router} />
    </AppProviders>,
  );
}

test("首页引导真实编辑，路由往返和重新打开均能恢复草稿", async () => {
  const first = await mount();
  await page.getByRole("link", { name: "开始写下想法" }).click();
  await page.getByRole("textbox", { name: "草稿标题" }).fill("周末的一个小想法");
  await page.getByRole("textbox", { name: "想法与笔记" }).fill("先写下一句话，再想下一步。");
  await expect.poll(() => page.getByRole("status").element().textContent).toContain("已保存在本机");
  expect(localStorage.getItem(draftStorageKey)).toContain("先写下一句话");
  await page.getByRole("navigation").getByRole("link", { name: "首页", exact: true }).click();
  await page.getByRole("link", { name: "继续我的草稿" }).click();
  await expect
    .element(page.getByRole("textbox", { name: "草稿标题" }))
    .toHaveValue("周末的一个小想法");
  await first.unmount();
  await mount("/workspace");
  await expect
    .element(page.getByRole("textbox", { name: "想法与笔记" }))
    .toHaveValue("先写下一句话，再想下一步。");
});

test("语言、外观和可选配色立即生效，重开后仍保留", async () => {
  const first = await mount();
  await page.getByRole("button", { name: "偏好设置", exact: true }).click();
  await page.getByRole("radio", { name: "English", exact: true }).click();
  await expect.element(page.getByRole("dialog")).toHaveAccessibleName("Preferences");
  expect(document.documentElement.lang).toBe("en");
  await page.getByRole("radio", { name: "Dark", exact: true }).click();
  await page.getByRole("radio", { name: "Moss", exact: true }).click();
  await page.getByRole("radio", { name: "Clay", exact: true }).click();
  await page.getByRole("radio", { name: "Compact", exact: true }).click();
  expect(document.documentElement.dataset.mode).toBe("dark");
  expect(document.documentElement.dataset.palette).toBe("moss");
  expect(document.documentElement.dataset.accent).toBe("clay");
  expect(document.documentElement.dataset.density).toBe("compact");
  expect(localStorage.getItem(modeStorageKey)).toBe("dark");
  await page.getByRole("button", { name: "Close", exact: true }).click();
  await expect
    .element(page.getByRole("heading", { level: 1 }))
    .toHaveTextContent("Turn an idea into a next step.");
  await first.unmount();
  await mount();
  await page.getByRole("button", { name: "Preferences", exact: true }).click();
  await expect.element(page.getByRole("radio", { name: "Dark", exact: true })).toBeChecked();
  await expect.element(page.getByRole("radio", { name: "Moss", exact: true })).toBeChecked();
  await expect.element(page.getByRole("radio", { name: "Clay", exact: true })).toBeChecked();
});

test("弹窗保持真实焦点，关闭后回到打开它的操作", async () => {
  await mount();
  const trigger = page.getByRole("button", { name: "调整使用偏好" });
  await trigger.click();
  await expect.element(page.getByRole("dialog")).toBeVisible();
  expect(document.activeElement?.closest('[role="dialog"]')).not.toBeNull();
  await userEvent.keyboard("{Escape}");
  await expect.element(page.getByRole("dialog")).not.toBeInTheDocument();
  await expect.element(trigger).toHaveFocus();
});

test("失效的持久化偏好能安全恢复，并明确告知使用者", async () => {
  localStorage.setItem(
    preferenceStorageKey,
    JSON.stringify({ version: 1, locale: "unknown", palette: "unknown" }),
  );
  await mount();
  await page.getByRole("button", { name: "偏好设置", exact: true }).click();
  await expect.element(page.getByRole("radio", { name: "简体中文", exact: true })).toBeChecked();
  await expect
    .element(page.getByText("之前的偏好无法读取，已恢复默认设置。你可以重新调整。"))
    .toBeVisible();
  await page.getByRole("radio", { name: "暗色", exact: true }).click();
  await page.getByRole("button", { name: "恢复默认偏好" }).click();
  await expect
    .element(page.getByRole("radio", { name: /跟随系统|System/, exact: true }))
    .toBeChecked();
});

test("320 像素下核心输入和可滚动设置仍可操作", async () => {
  await page.viewport(320, 568);
  await mount();
  expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
  await page.getByRole("link", { name: "开始写下想法" }).click();
  await page.getByRole("textbox", { name: "想法与笔记" }).fill("窄屏也可以开始。");
  await expect
    .element(page.getByRole("textbox", { name: "想法与笔记" }))
    .toHaveValue("窄屏也可以开始。");
  expect(
    getComputedStyle(page.getByRole("textbox", { name: "想法与笔记" }).element()).fontSize,
  ).toBe("16px");
  expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
  await page.getByRole("button", { name: "偏好设置", exact: true }).click();
  await page.getByRole("radio", { name: "English", exact: true }).click();
  await page.getByRole("radio", { name: "Compact", exact: true }).click();
  await expect.element(page.getByRole("radio", { name: "Compact", exact: true })).toBeChecked();
  await page.getByRole("button", { name: "Close", exact: true }).click();
  expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
});

test("存储写入失败时保留当前草稿，并说明关闭页面的后果", async () => {
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new DOMException("Storage is unavailable", "QuotaExceededError");
  });
  await mount("/workspace");
  await page.getByRole("textbox", { name: "想法与笔记" }).fill("这段内容需要留在当前页面。");
  await expect
    .poll(() => page.getByRole("status").element().textContent)
    .toContain("关闭前请复制需要保留的文字");
  await expect
    .element(page.getByRole("textbox", { name: "想法与笔记" }))
    .toHaveValue("这段内容需要留在当前页面。");
  await page.getByRole("navigation").getByRole("link", { name: "首页", exact: true }).click();
  await page.getByRole("link", { name: "继续我的草稿" }).click();
  await expect
    .element(page.getByRole("textbox", { name: "想法与笔记" }))
    .toHaveValue("这段内容需要留在当前页面。");
  await page.getByRole("button", { name: "偏好设置", exact: true }).click();
  await page.getByRole("radio", { name: "暗色", exact: true }).click();
  await expect
    .element(page.getByText("偏好暂时只保留在当前页面，浏览器未能保存这次修改。"))
    .toBeVisible();
});
