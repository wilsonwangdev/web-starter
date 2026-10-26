import * as Dialog from "@radix-ui/react-dialog";
import { Check, Monitor, Moon, Sun, X } from "lucide-react";
import { useId, type ReactNode } from "react";
import { useCopy } from "../i18n/useCopy";
import { usePreferences } from "./context";

export function PreferencesDialog({
  children,
  extraSettings,
}: {
  children: ReactNode;
  extraSettings?: ReactNode;
}) {
  const { t } = useCopy();
  const preferences = usePreferences();
  const group = useId();
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="preferences-dialog">
          <div className="dialog-heading">
            <div>
              <Dialog.Title>{t("settings.title")}</Dialog.Title>
              <Dialog.Description>{t("settings.description")}</Dialog.Description>
            </div>
            <Dialog.Close className="icon-button dialog-close" aria-label={t("common.close")}>
              <X aria-hidden="true" />
            </Dialog.Close>
          </div>
          <div className="settings-content">
            <fieldset className="setting-group">
              <legend>{t("settings.language")}</legend>
              <div className="choice-row">
                <Choice
                  name={`${group}-language`}
                  value="zh-CN"
                  checked={preferences.locale === "zh-CN"}
                  onChange={() => preferences.setLocale("zh-CN")}
                >
                  简体中文
                </Choice>
                <Choice
                  name={`${group}-language`}
                  value="en"
                  checked={preferences.locale === "en"}
                  onChange={() => preferences.setLocale("en")}
                >
                  English
                </Choice>
              </div>
            </fieldset>
            <fieldset className="setting-group">
              <legend>{t("settings.appearance")}</legend>
              <div className="choice-row">
                <Choice
                  name={`${group}-mode`}
                  value="light"
                  checked={preferences.mode === "light"}
                  onChange={() => preferences.setMode("light")}
                >
                  <Sun aria-hidden="true" />
                  {t("settings.light")}
                </Choice>
                <Choice
                  name={`${group}-mode`}
                  value="dark"
                  checked={preferences.mode === "dark"}
                  onChange={() => preferences.setMode("dark")}
                >
                  <Moon aria-hidden="true" />
                  {t("settings.dark")}
                </Choice>
                <Choice
                  name={`${group}-mode`}
                  value="system"
                  checked={preferences.mode === "system"}
                  onChange={() => preferences.setMode("system")}
                >
                  <Monitor aria-hidden="true" />
                  {t("settings.system")}
                </Choice>
              </div>
            </fieldset>
            <fieldset className="setting-group">
              <legend>{t("settings.palette")}</legend>
              <div className="choice-row">
                <Choice
                  name={`${group}-palette`}
                  value="indigo"
                  checked={preferences.palette === "indigo"}
                  onChange={() => preferences.setPalette("indigo")}
                >
                  <span className="palette-preview palette-indigo" aria-hidden="true" />
                  {t("settings.indigo")}
                </Choice>
                <Choice
                  name={`${group}-palette`}
                  value="moss"
                  checked={preferences.palette === "moss"}
                  onChange={() => preferences.setPalette("moss")}
                >
                  <span className="palette-preview palette-moss" aria-hidden="true" />
                  {t("settings.moss")}
                </Choice>
              </div>
            </fieldset>
            <fieldset className="setting-group">
              <legend>{t("settings.accent")}</legend>
              <div className="choice-row">
                <Choice
                  name={`${group}-accent`}
                  value="theme"
                  checked={preferences.accent === "theme"}
                  onChange={() => preferences.setAccent("theme")}
                >
                  {t("settings.theme")}
                </Choice>
                <Choice
                  name={`${group}-accent`}
                  value="clay"
                  checked={preferences.accent === "clay"}
                  onChange={() => preferences.setAccent("clay")}
                >
                  <span className="palette-preview palette-clay" aria-hidden="true" />
                  {t("settings.clay")}
                </Choice>
                <Choice
                  name={`${group}-accent`}
                  value="ocean"
                  checked={preferences.accent === "ocean"}
                  onChange={() => preferences.setAccent("ocean")}
                >
                  <span className="palette-preview palette-ocean" aria-hidden="true" />
                  {t("settings.ocean")}
                </Choice>
              </div>
              <p className="setting-hint">{t("settings.hint")}</p>
            </fieldset>
            <fieldset className="setting-group">
              <legend>{t("settings.density")}</legend>
              <div className="choice-row">
                <Choice
                  name={`${group}-density`}
                  value="comfortable"
                  checked={preferences.density === "comfortable"}
                  onChange={() => preferences.setDensity("comfortable")}
                >
                  {t("settings.comfortable")}
                </Choice>
                <Choice
                  name={`${group}-density`}
                  value="compact"
                  checked={preferences.density === "compact"}
                  onChange={() => preferences.setDensity("compact")}
                >
                  {t("settings.compact")}
                </Choice>
              </div>
            </fieldset>
            {extraSettings}
          </div>
          <div className="dialog-footer">
            {preferences.recovered && (
              <output className="storage-warning">{t("settings.recovered")}</output>
            )}
            {preferences.persistenceFailed && (
              <output className="storage-warning">{t("settings.storageWarning")}</output>
            )}
            <button className="text-button reset-button" type="button" onClick={preferences.reset}>
              {t("settings.reset")}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Choice({
  name,
  value,
  checked,
  onChange,
  children,
}: {
  name: string;
  value: string;
  checked: boolean;
  onChange: () => void;
  children: ReactNode;
}) {
  return (
    <label className="choice">
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} />
      <span className="choice-content">
        {children}
        <Check className="choice-check" aria-hidden="true" />
      </span>
    </label>
  );
}
