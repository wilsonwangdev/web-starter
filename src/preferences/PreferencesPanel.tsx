import { Button } from "@web-starter/ui/components/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@web-starter/ui/components/select";
import { Check, Monitor, Moon, Sun } from "lucide-react";
import { useId, type ReactNode } from "react";
import { useCopy } from "../i18n/useCopy";
import { usePreferences } from "./context";
import { densitySchema } from "./model";

export default function PreferencesPanel({ extraSettings }: { extraSettings?: ReactNode }) {
  const { t } = useCopy();
  const preferences = usePreferences();
  const group = useId();
  return (
    <>
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
          <Select
            value={preferences.density}
            onValueChange={(value) => {
              const parsed = densitySchema.safeParse(value);
              if (parsed.success) preferences.setDensity(parsed.data);
            }}
          >
            <SelectTrigger className="density-select" aria-label={t("settings.density")}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper" sideOffset={6} collisionPadding={16}>
              <SelectItem value="comfortable">{t("settings.comfortable")}</SelectItem>
              <SelectItem value="compact">{t("settings.compact")}</SelectItem>
            </SelectContent>
          </Select>
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
        <Button
          variant="ghost"
          className="text-button reset-button"
          type="button"
          onClick={preferences.reset}
        >
          {t("settings.reset")}
        </Button>
      </div>
    </>
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
