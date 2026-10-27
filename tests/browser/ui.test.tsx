import { afterEach, expect, test } from "vite-plus/test";
import { page } from "vite-plus/test/browser";
import { cleanup, render } from "vitest-browser-react";
import { Button } from "@web-starter/ui/components/button";
import "../../src/index.css";

const initialMode = document.documentElement.dataset.mode;

afterEach(async () => {
  await cleanup();
  if (initialMode) document.documentElement.dataset.mode = initialMode;
  else delete document.documentElement.dataset.mode;
});

function colorChannels(color: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("浏览器无法读取组件颜色。");
  context.fillStyle = color;
  context.fillRect(0, 0, 1, 1);
  return context.getImageData(0, 0, 1, 1).data;
}

function linear(value: number) {
  return value / 255 <= 0.04045 ? value / 255 / 12.92 : ((value / 255 + 0.055) / 1.055) ** 2.4;
}

function luminance(color: string) {
  const [red = 0, green = 0, blue = 0] = colorChannels(color);
  return 0.2126 * linear(red) + 0.7152 * linear(green) + 0.0722 * linear(blue);
}

test.each(["light", "dark"])("%s 主题下直接消费默认、描边与禁用按钮", async (mode) => {
  document.documentElement.dataset.mode = mode;
  await render(
    <>
      <Button>主要操作</Button>
      <Button variant="outline">次要操作</Button>
      <Button disabled>不可用操作</Button>
    </>,
  );
  const primary = page.getByRole("button", { name: "主要操作", exact: true });
  const outline = page.getByRole("button", { name: "次要操作", exact: true });
  await expect.element(primary).toBeVisible();
  const primaryStyle = getComputedStyle(primary.element());
  const foreground = luminance(primaryStyle.color);
  const background = luminance(primaryStyle.backgroundColor);
  expect(
    (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05),
  ).toBeGreaterThanOrEqual(4.5);
  expect(colorChannels(primaryStyle.backgroundColor)[3]).toBe(255);
  const outlineStyle = getComputedStyle(outline.element());
  expect(Number.parseFloat(outlineStyle.borderTopWidth)).toBeGreaterThan(0);
  expect(outlineStyle.borderTopStyle).not.toBe("none");
  expect(colorChannels(outlineStyle.borderTopColor)[3]).toBeGreaterThan(0);
  await expect
    .element(page.getByRole("button", { name: "不可用操作", exact: true }))
    .toBeDisabled();
});
