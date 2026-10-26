import type { Plugin } from "vite";
import { webManifest } from "./web-manifest.ts";

// Vite 负责开发与构建；此接线仅派生一份项目清单产物。
export function manifestAsset(): Plugin {
  const source = JSON.stringify(webManifest);
  return {
    name: "project-manifest",
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        if (request.url?.split("?", 1)[0] !== "/manifest.webmanifest") return next();
        if (request.method !== "GET" && request.method !== "HEAD") {
          response.statusCode = 405;
          response.setHeader("Allow", "GET, HEAD");
          response.end();
          return;
        }
        response.setHeader("Content-Type", "application/manifest+json");
        response.setHeader("Cache-Control", "no-cache");
        response.end(request.method === "HEAD" ? undefined : source);
      });
    },
    generateBundle() {
      this.emitFile({ type: "asset", fileName: "manifest.webmanifest", source });
    },
  };
}

export function htmlText(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    switch (character) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#39;";
      default:
        return character;
    }
  });
}
