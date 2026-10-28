import { lint } from "./tooling/lint.ts";
import { defineConfig, lazyPlugins } from "vite-plus";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { project } from "./shared/project.ts";
import { appearanceStorageKey } from "./shared/appearance.ts";
import { interfacePreferenceStorageKey } from "./shared/preferences.ts";
import { initializeAppearance } from "./src/preferences/initialize-appearance.ts";
import { htmlText, manifestAsset } from "./build/metadata.ts";
import { installStartupRecovery, showStartupError } from "./src/startup-recovery.ts";
import { zhCN } from "./src/i18n/locales/zh-CN.ts";
import { en } from "./src/i18n/locales/en.ts";

export default defineConfig({
  run: {
    tasks: {
      "production-build": {
        command: "pnpm build",
        cache: {
          input: [{ auto: true }, "packages/ui/src/**", "packages/ui/package.json", "public/**"],
          output: ["dist/**"],
        },
      },
    },
  },
  fmt: {
    ignorePatterns: [
      "dist/**",
      ".local/**",
      "test-results/**",
      "playwright-report/**",
      "pnpm-lock.yaml",
    ],
  },
  lint,
  plugins:
    lazyPlugins(() => [
      react(),
      tailwindcss(),
      manifestAsset(),
      {
        name: "appearance-before-paint",
        transformIndexHtml: {
          order: "pre",
          handler: () => [
            {
              tag: "script",
              attrs: { "data-appearance-init": "" },
              children: `(${initializeAppearance.toString()})(${JSON.stringify(appearanceStorageKey(project.storageNamespace))});`,
              injectTo: "head-prepend",
            },
            {
              tag: "script",
              attrs: { "data-startup-recovery": "" },
              children: `(${installStartupRecovery.toString()})(${showStartupError.toString()},${JSON.stringify({ "zh-CN": zhCN.startup, en: en.startup })},${JSON.stringify(interfacePreferenceStorageKey(project.storageNamespace))},${JSON.stringify(project.locale)});`,
              injectTo: "head",
            },
          ],
        },
      },
    ]) ?? [],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
    dedupe: ["react", "react-dom"],
  },
  build: {
    // 某些 WebKit 版本会缓存失败的 modulepreload，连手动刷新也无法恢复。
    // 保留原生 import 与异步 CSS 加载，避免额外 JS 预加载污染恢复路径。
    // https://bugs.webkit.org/show_bug.cgi?id=270357
    modulePreload: false,
  },
  define: {
    "import.meta.env.PUBLIC_PROJECT": JSON.stringify(project),
    ...Object.fromEntries(
      Object.entries({
        HTML_PROJECT_TITLE: `${project.displayName} · ${project.tagline}`,
        HTML_PROJECT_DESCRIPTION: project.description,
        HTML_PROJECT_LOCALE: project.locale,
        HTML_PROJECT_THEME: project.themeColor,
        HTML_STARTUP_LOADING: (project.locale === "en" ? en : zhCN).startup.loading,
        HTML_STARTUP_ERROR_TITLE: (project.locale === "en" ? en : zhCN).startup.title,
        HTML_STARTUP_ERROR_DESCRIPTION: (project.locale === "en" ? en : zhCN).startup.description,
        HTML_STARTUP_RELOAD: (project.locale === "en" ? en : zhCN).startup.reload,
        HTML_STARTUP_NO_SCRIPT_TITLE: (project.locale === "en" ? en : zhCN).startup.noScriptTitle,
        HTML_STARTUP_NO_SCRIPT_DESCRIPTION: (project.locale === "en" ? en : zhCN).startup
          .noScriptDescription,
      }).map(([key, value]) => [`import.meta.env.${key}`, JSON.stringify(htmlText(value))]),
    ),
  },
  server: {
    host: "127.0.0.1",
    port: 4322,
    strictPort: true,
    fs: {
      deny: [
        ".env",
        ".env.*",
        "*.{crt,pem,key,p12,pfx}",
        "**/.git/**",
        "**/.local/**",
        "**/AGENTS.local.md",
        "**/.agents/local/**",
      ],
    },
  },
  preview: { host: "127.0.0.1", port: 4323, strictPort: true },
});
