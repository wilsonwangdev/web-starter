import { afterEach, beforeEach, expect, test, vi } from "vite-plus/test";
import { page } from "vite-plus/test/browser";
import { cleanup, render } from "vitest-browser-react";
import { AppProviders } from "../../src/preferences/Providers";
import { InstallProvider } from "../../src/pwa/InstallProvider";
import { InstallSettings } from "../../src/pwa/InstallSettings";
import "../../src/index.css";

type Choice = { outcome: "accepted" | "dismissed" };

class InstallPrompt extends Event {
  readonly prompt;
  constructor(choose: () => Promise<Choice>) {
    super("beforeinstallprompt", { cancelable: true });
    this.prompt = vi.fn<() => Promise<Choice>>(choose);
  }
}

beforeEach(() => {
  localStorage.clear();
});
afterEach(async () => {
  await cleanup();
  vi.restoreAllMocks();
  localStorage.clear();
});

function mount() {
  return render(
    <AppProviders initialLocale="zh-CN">
      <InstallProvider>
        <InstallSettings />
      </InstallProvider>
    </AppProviders>,
  );
}

function expectStatus(text: string) {
  return expect.poll(() => page.getByRole("status").element().textContent).toContain(text);
}

test("捕获安装能力时不弹窗，仅在使用者点击后调用一次", async () => {
  await mount();
  const event = new InstallPrompt(() => Promise.resolve({ outcome: "accepted" }));
  window.dispatchEvent(event);
  await expect.element(page.getByRole("button", { name: "安装到设备" })).toBeVisible();
  expect(event.defaultPrevented).toBe(true);
  expect(event.prompt).not.toHaveBeenCalled();
  await page.getByRole("button", { name: "安装到设备" }).click();
  await expectStatus("已接受安装请求");
  expect(event.prompt).toHaveBeenCalledTimes(1);
  await expect.element(page.getByRole("button", { name: "安装到设备" })).not.toBeInTheDocument();
});

test("取消安装后回到手动入口，新安装能力可再次使用", async () => {
  await mount();
  window.dispatchEvent(new InstallPrompt(() => Promise.resolve({ outcome: "dismissed" })));
  await page.getByRole("button", { name: "安装到设备" }).click();
  await expectStatus("可在菜单中选择");
  const next = new InstallPrompt(() => Promise.resolve({ outcome: "accepted" }));
  window.dispatchEvent(next);
  await page.getByRole("button", { name: "安装到设备" }).click();
  expect(next.prompt).toHaveBeenCalledTimes(1);
});

test("浏览器拒绝打开安装窗口时给出手动处理说明", async () => {
  await mount();
  const event = new InstallPrompt(() => Promise.reject(new Error("Installation unavailable")));
  window.dispatchEvent(event);
  await page.getByRole("button", { name: "安装到设备" }).click();
  await expectStatus("安装请求未能打开，请稍后重试或使用浏览器菜单");
  expect(event.prompt).toHaveBeenCalledTimes(1);
});

test("浏览器确认安装后，迟到的取消结果和新提示都不会覆盖状态", async () => {
  await mount();
  const pending: { finish?: (choice: Choice) => void } = {};
  const event = new InstallPrompt(
    () =>
      new Promise<Choice>((resolve) => {
        pending.finish = resolve;
      }),
  );
  window.dispatchEvent(event);
  await page.getByRole("button", { name: "安装到设备" }).click();
  await expectStatus("安装窗口中继续");
  window.dispatchEvent(new Event("appinstalled"));
  pending.finish?.({ outcome: "dismissed" });
  await expectStatus("浏览器已确认安装");
  const late = new InstallPrompt(() => Promise.resolve({ outcome: "accepted" }));
  window.dispatchEvent(late);
  await expectStatus("浏览器已确认安装");
  await expect.element(page.getByRole("button", { name: "安装到设备" })).not.toBeInTheDocument();
  expect(late.prompt).not.toHaveBeenCalled();
});
