import type { ReactNode } from "react";
import { Asterisk, Settings2 } from "lucide-react";
import { Link, NavLink, ScrollRestoration } from "react-router";
import { useCopy } from "../i18n/useCopy";
import { PreferencesDialog } from "../preferences/PreferencesDialog";
import { project } from "../project";
import { Button } from "@web-starter/ui/components/button";

interface AppShellProps {
  children: ReactNode;
  extraSettings?: ReactNode;
}

export function AppShell({ children, extraSettings }: AppShellProps) {
  const { t } = useCopy();
  return (
    <div className="app-shell">
      <a
        className="skip-link"
        href="#main"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById("main")?.focus();
        }}
      >
        {t("nav.skip")}
      </a>
      <header className="site-header page-width">
        <Link className="brand" to="/" aria-label={`${project.displayName} · ${t("nav.home")}`}>
          <span className="brand-mark">
            <Asterisk aria-hidden="true" />
          </span>
          <span className="brand-name" title={project.displayName}>
            {project.displayName}
          </span>
        </Link>
        <nav className="main-nav" aria-label={t("nav.main")}>
          <NavLink to="/" end>
            {t("nav.home")}
          </NavLink>
          <NavLink to="/workspace">{t("nav.workspace")}</NavLink>
        </nav>
        <PreferencesDialog extraSettings={extraSettings}>
          <Button
            variant="ghost"
            size="icon"
            className="icon-button preferences-trigger"
            type="button"
            aria-label={t("nav.preferences")}
          >
            <Settings2 aria-hidden="true" />
          </Button>
        </PreferencesDialog>
      </header>
      <main id="main" className="main-content" tabIndex={-1}>
        {children}
      </main>
      <footer className="site-footer page-width">
        <span>{project.displayName}</span>
        <p>{t("footer.local")}</p>
      </footer>
      <ScrollRestoration />
    </div>
  );
}
