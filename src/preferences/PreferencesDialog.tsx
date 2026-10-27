import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@web-starter/ui/components/dialog";
import { Button } from "@web-starter/ui/components/button";
import { X } from "lucide-react";
import { lazy, Suspense, type ReactNode } from "react";
import { useCopy } from "../i18n/useCopy";

const PreferencesPanel = lazy(() =>
  import("./PreferencesPanel").catch((error: unknown) => {
    console.error("Failed to load preferences panel.", error);
    return { default: PreferencesUnavailable };
  }),
);

function PreferencesUnavailable() {
  const { t } = useCopy();
  return (
    <div className="settings-content">
      <output className="setting-hint">{t("settings.unavailable")}</output>
    </div>
  );
}

export function PreferencesDialog({
  children,
  extraSettings,
}: {
  children: ReactNode;
  extraSettings?: ReactNode;
}) {
  const { t } = useCopy();
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="preferences-dialog">
        <div className="dialog-heading">
          <div>
            <DialogTitle>{t("settings.title")}</DialogTitle>
            <DialogDescription>{t("settings.description")}</DialogDescription>
          </div>
          <DialogClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="icon-button dialog-close"
              aria-label={t("common.close")}
            >
              <X aria-hidden="true" />
            </Button>
          </DialogClose>
        </div>
        <Suspense
          fallback={
            <div className="settings-content">
              <output className="setting-hint">{t("common.loading")}</output>
            </div>
          }
        >
          <PreferencesPanel extraSettings={extraSettings} />
        </Suspense>
      </DialogContent>
    </Dialog>
  );
}
