import { lint } from "./tooling/lint.ts";
import { defineConfig, lazyPlugins } from "vite-plus";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { project } from "./shared/project.ts";
import { appearanceStorageKey } from "./shared/appearance.ts";
import { initializeAppearance } from "./src/preferences/initialize-appearance.ts";
import { htmlText, manifestAsset } from "./build/metadata.ts";

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
          ],
        },
      },
    ]) ?? [],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
    dedupe: ["react", "react-dom"],
  },
  define: {
    "import.meta.env.PUBLIC_PROJECT": JSON.stringify(project),
    ...Object.fromEntries(
      Object.entries({
        HTML_PROJECT_TITLE: `${project.displayName} · ${project.tagline}`,
        HTML_PROJECT_DESCRIPTION: project.description,
        HTML_PROJECT_LOCALE: project.locale,
        HTML_PROJECT_THEME: project.themeColor,
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
