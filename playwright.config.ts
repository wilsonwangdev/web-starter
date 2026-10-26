import { defineConfig, devices } from "playwright/test";

const channel = process.env.PLAYWRIGHT_CHROMIUM_CHANNEL;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: { baseURL: "http://127.0.0.1:4323", trace: "retain-on-failure" },
  webServer: {
    command: "pnpm exec vite preview --host 127.0.0.1 --port 4323 --strictPort",
    url: "http://127.0.0.1:4323",
    reuseExistingServer: false,
  },
  projects: [
    { name: "chromium", use: { browserName: "chromium", ...(channel ? { channel } : {}) } },
    { name: "webkit-mobile", use: { ...devices["iPhone 13"], browserName: "webkit" } },
  ],
});
