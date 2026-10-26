import { z } from "zod";
import { appearanceStorageKey } from "../../shared/appearance";
import { project } from "../project";

export const localeSchema = z.enum(["zh-CN", "en"]);
export const modeSchema = z.enum(["light", "dark", "system"]);
export const paletteSchema = z.enum(["indigo", "moss"]);
export const accentSchema = z.enum(["theme", "clay", "ocean"]);
export const densitySchema = z.enum(["comfortable", "compact"]);
export type Locale = z.infer<typeof localeSchema>;
export type AppearanceMode = z.infer<typeof modeSchema>;
export type Palette = z.infer<typeof paletteSchema>;
export type Accent = z.infer<typeof accentSchema>;
export type Density = z.infer<typeof densitySchema>;

export const preferenceStorageKey = `${project.storageNamespace}-preferences-v1`;
export const modeStorageKey = appearanceStorageKey(project.storageNamespace);
export const preferenceSchema = z.object({
  version: z.literal(1),
  locale: localeSchema,
  palette: paletteSchema,
  accent: accentSchema,
  density: densitySchema,
});
export type InterfacePreferences = z.infer<typeof preferenceSchema>;

export function detectLocale(languages: readonly string[]): Locale {
  for (const value of languages) {
    if (value.toLowerCase().startsWith("zh")) return "zh-CN";
    if (value.toLowerCase().startsWith("en")) return "en";
  }
  return project.locale === "en" ? "en" : "zh-CN";
}

export function defaultPreferences(locale: Locale): InterfacePreferences {
  return { version: 1, locale, palette: "indigo", accent: "theme", density: "comfortable" };
}

export function readPreferences(initialLocale?: Locale): {
  preferences: InterfacePreferences;
  recovered: boolean;
} {
  const fallback = defaultPreferences(initialLocale ?? detectLocale(navigator.languages));
  try {
    const raw = localStorage.getItem(preferenceStorageKey);
    if (!raw) return { preferences: fallback, recovered: false };
    const result = preferenceSchema.safeParse(JSON.parse(raw));
    return result.success
      ? { preferences: result.data, recovered: false }
      : { preferences: fallback, recovered: true };
  } catch {
    return { preferences: fallback, recovered: true };
  }
}
