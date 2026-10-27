import { Download } from "lucide-react";
import { useCopy } from "../i18n/useCopy";
import { useInstall } from "./useInstall";
import { Button } from "@web-starter/ui/components/button";

export function InstallSettings() {
  const { t } = useCopy();
  const { status, install } = useInstall();
  return (
    <section className="setting-group" aria-labelledby="install-title">
      <h3 id="install-title">{t("install.title")}</h3>
      <p className="setting-hint">{t("install.description")}</p>
      <output className="setting-hint">{t(`install.${status}`)}</output>
      {status === "available" && (
        <Button
          className="button button-primary"
          type="button"
          onClick={() => {
            void install();
          }}
        >
          <Download aria-hidden="true" />
          {t("install.install")}
        </Button>
      )}
    </section>
  );
}
