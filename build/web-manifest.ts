import type { WebAppManifest } from "web-app-manifest";
import { project } from "../shared/project.ts";

export function createWebManifest(base = "/") {
  return {
    id: base,
    name: project.displayName,
    short_name: project.displayName,
    description: project.description,
    lang: project.locale,
    start_url: base,
    scope: base,
    display: "standalone",
    theme_color: project.themeColor,
    background_color: project.themeColor,
    icons: [
      { src: `${base}pwa-192x192.png`, sizes: "192x192", type: "image/png", purpose: "any" },
      { src: `${base}pwa-512x512.png`, sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: `${base}maskable-icon-512x512.png`,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  } satisfies WebAppManifest;
}

export const webManifest = createWebManifest();
