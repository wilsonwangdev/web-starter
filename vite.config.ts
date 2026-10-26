import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { project } from "./shared/project.ts";
import { appearanceStorageKey } from "./shared/appearance.ts";
import { initializeAppearance } from "./src/preferences/initialize-appearance.ts";
import { htmlText, manifestAsset } from "./build/metadata.ts";

export default defineConfig({
  plugins: [
    react(),
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
  ],
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
