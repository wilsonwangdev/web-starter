import { expect, test } from "vite-plus/test";
import { createCn } from "cn/config";
import { cn } from "../src/lib/utils.ts";

const reference = createCn({ prefix: "ui" });

test.each([
  ["ui:px-4 ui:py-2", "ui:px-6"],
  ["ui:bg-primary ui:text-sm", "ui:bg-secondary ui:text-popover-foreground"],
  ["ui:hover:bg-primary ui:sm:px-2", "ui:hover:bg-secondary ui:sm:px-4"],
  ["ui:max-w-sm ui:rounded-lg", "ui:max-w-[calc(100%-2rem)] ui:rounded-xl"],
  ["ui:[&_svg]:size-4", "ui:[&_svg]:size-5"],
  ["ui:focus-visible:ring-3 ui:focus-visible:ring-ring/50", "ui:focus-visible:ring-2"],
  ["button button-primary p-2", "dialog-content p-4 ui:p-5"],
])("precompiled UI rules preserve prefixed overrides: %s + %s", (base, override) => {
  expect(cn(base, override)).toBe(reference(base, override));
});

test("conditional and object classes retain their existing public behavior", () => {
  const values = ["ui:px-2", false, undefined, ["ui:py-3"], { "ui:px-6": true, "ui:py-5": false }];
  expect(cn(...values)).toBe(reference(...values));
});
