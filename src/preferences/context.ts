import { createContext, useContext } from "react";
import type {
  Accent,
  AppearanceMode,
  Density,
  InterfacePreferences,
  Locale,
  Palette,
} from "./model";

export interface PreferencesValue extends InterfacePreferences {
  mode: AppearanceMode;
  persistenceFailed: boolean;
  recovered: boolean;
  setLocale: (value: Locale) => void;
  setMode: (value: AppearanceMode) => void;
  setPalette: (value: Palette) => void;
  setAccent: (value: Accent) => void;
  setDensity: (value: Density) => void;
  reset: () => void;
}
export const PreferencesContext = createContext<PreferencesValue | null>(null);
export function usePreferences() {
  const value = useContext(PreferencesContext);
  if (!value) throw new Error("Preferences require AppProviders.");
  return value;
}
