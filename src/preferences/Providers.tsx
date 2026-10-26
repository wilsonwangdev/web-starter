import { useCallback, useEffect, useLayoutEffect, useMemo, useState, type ReactNode } from "react";
import { createInstance, type i18n as I18n } from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { ThemeProvider, useTheme } from "next-themes";
import useLocalStorageState from "use-local-storage-state";
import { resources } from "../i18n/resources";
import { PreferencesContext } from "./context";
import {
  defaultPreferences,
  detectLocale,
  modeSchema,
  modeStorageKey,
  preferenceSchema,
  preferenceStorageKey,
  readPreferences,
  type Accent,
  type AppearanceMode,
  type Density,
  type InterfacePreferences,
  type Locale,
  type Palette,
} from "./model";

export function AppProviders({
  children,
  initialLocale,
}: {
  children: ReactNode;
  initialLocale?: Locale;
}) {
  const [initial] = useState(() => readPreferences(initialLocale));
  const [i18n] = useState(() => {
    const instance = createInstance();
    void instance.use(initReactI18next).init({
      resources,
      lng: initial.preferences.locale,
      fallbackLng: "zh-CN",
      supportedLngs: ["zh-CN", "en"],
      initAsync: false,
      interpolation: { escapeValue: false },
      returnNull: false,
    });
    return instance;
  });
  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider
        attribute="data-mode"
        storageKey={modeStorageKey}
        defaultTheme="system"
        themes={["light", "dark"]}
        enableSystem
        enableColorScheme
        scriptProps={{ type: "text/plain" }}
        disableTransitionOnChange
      >
        <PreferenceState initial={initial.preferences} recovered={initial.recovered} i18n={i18n}>
          {children}
        </PreferenceState>
      </ThemeProvider>
    </I18nextProvider>
  );
}

function PreferenceState({
  children,
  initial,
  recovered,
  i18n,
}: {
  children: ReactNode;
  initial: InterfacePreferences;
  recovered: boolean;
  i18n: I18n;
}) {
  const [modePersistenceFailed, setModePersistenceFailed] = useState(false);
  const [preferences, setPreferences, { isPersistent }] =
    useLocalStorageState<InterfacePreferences>(preferenceStorageKey, {
      defaultValue: initial,
      serializer: preferenceSerializer,
    });
  const { theme, setTheme } = useTheme();
  const parsedMode = modeSchema.safeParse(theme);
  const mode = parsedMode.success ? parsedMode.data : "system";
  const changeMode = useCallback(
    (next: AppearanceMode) => {
      setTheme(next);
      try {
        setModePersistenceFailed(localStorage.getItem(modeStorageKey) !== next);
      } catch {
        setModePersistenceFailed(true);
      }
    },
    [setTheme],
  );

  useLayoutEffect(() => {
    document.documentElement.lang = preferences.locale;
    document.documentElement.dir = "ltr";
    void i18n.changeLanguage(preferences.locale);
  }, [preferences.locale, i18n]);
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.dataset.palette = preferences.palette;
    root.dataset.accent = preferences.accent;
    root.dataset.density = preferences.density;
  }, [preferences.palette, preferences.accent, preferences.density]);
  useLayoutEffect(() => {
    const updateBrowserColor = () => {
      const color = getComputedStyle(document.documentElement)
        .getPropertyValue("--color-page")
        .trim();
      if (color) document.querySelector('meta[name="theme-color"]')?.setAttribute("content", color);
    };
    const observer = new MutationObserver(updateBrowserColor);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-mode"],
    });
    updateBrowserColor();
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!modeSchema.safeParse(theme).success) setTheme("system");
  }, [theme, setTheme]);

  const value = useMemo(
    () => ({
      ...preferences,
      mode,
      recovered,
      persistenceFailed: !isPersistent || modePersistenceFailed,
      setLocale: (locale: Locale) => setPreferences((current) => ({ ...current, locale })),
      setMode: changeMode,
      setPalette: (palette: Palette) => setPreferences((current) => ({ ...current, palette })),
      setAccent: (accent: Accent) => setPreferences((current) => ({ ...current, accent })),
      setDensity: (density: Density) => setPreferences((current) => ({ ...current, density })),
      reset: () => {
        setPreferences(defaultPreferences(detectLocale(navigator.languages)));
        changeMode("system");
      },
    }),
    [preferences, mode, recovered, isPersistent, modePersistenceFailed, setPreferences, changeMode],
  );
  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}
const preferenceSerializer = {
  parse: (value: string) => preferenceSchema.parse(JSON.parse(value)),
  stringify: (value: unknown) => JSON.stringify(preferenceSchema.parse(value)),
};
