import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";
import { project } from "./shared/project.ts";

const channel = process.env.PLAYWRIGHT_CHROMIUM_CHANNEL;

export default defineConfig({
  test: {
    projects: [
      {
        extends: false,
        test: {
          name: "node",
          environment: "node",
          include: ["tests/*.test.ts"],
        },
      },
      {
        extends: false,
        plugins: [react()],
        define: { "import.meta.env.PUBLIC_PROJECT": JSON.stringify(project) },
        test: {
          name: "browser",
          include: ["tests/browser/**/*.test.tsx"],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(channel ? { launchOptions: { channel } } : {}),
            instances: [
              {
                browser: "chromium",
                name: "browser-desktop",
                viewport: { width: 1280, height: 900 },
              },
              {
                browser: "webkit",
                name: "browser-mobile",
                viewport: { width: 390, height: 844 },
                provider: playwright({ contextOptions: { isMobile: true, hasTouch: true } }),
              },
            ],
          },
        },
      },
    ],
  },
});
