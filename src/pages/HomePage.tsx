import type { ReactNode } from "react";
import { ArrowRight, ArrowUpRight, Asterisk, PenLine } from "lucide-react";
import { Link } from "react-router";
import { useDocumentTitle } from "../app/useDocumentTitle";
import { useCopy } from "../i18n/useCopy";
import { PreferencesDialog } from "../preferences/PreferencesDialog";

export function HomePage({
  hasDraft,
  extraSettings,
}: {
  hasDraft: boolean;
  extraSettings?: ReactNode;
}) {
  const { t } = useCopy();
  useDocumentTitle(t("nav.home"));
  return (
    <div className="home page-width">
      <section className="hero" aria-labelledby="home-title">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="status-dot" />
            {t("home.eyebrow")}
          </p>
          <h1 id="home-title">{t("home.title")}</h1>
          <p className="hero-description">{t("home.description")}</p>
          <div className="hero-actions">
            <Link className="button button-primary" to="/workspace">
              {hasDraft ? t("home.resume") : t("home.start")}
              <ArrowRight aria-hidden="true" />
            </Link>
            <PreferencesDialog extraSettings={extraSettings}>
              <button type="button" className="text-button">
                {t("home.secondary")}
                <ArrowUpRight aria-hidden="true" />
              </button>
            </PreferencesDialog>
          </div>
          <p className="subtle-note">{t("home.note")}</p>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="art-orbit" />
          <div className="art-page">
            <PenLine className="art-pen" />
            <div className="art-line art-line-heading" />
            <div className="art-line" />
            <div className="art-line" />
            <div className="art-line art-line-short" />
            <div className="art-cursor" />
            <span className="art-page-number">01</span>
          </div>
          <div className="art-point">
            <Asterisk />
          </div>
        </div>
      </section>
      <section className="begin-section" aria-labelledby="begin-title">
        <div className="section-intro">
          <h2 id="begin-title">{t("home.smallTitle")}</h2>
          <p>{t("home.smallDescription")}</p>
        </div>
        <ol className="begin-steps">
          <li>
            <span className="step-number">01</span>
            <h3>{t("home.first")}</h3>
            <p>{t("home.firstDescription")}</p>
          </li>
          <li>
            <span className="step-number">02</span>
            <h3>{t("home.second")}</h3>
            <p>{t("home.secondDescription")}</p>
          </li>
          <li>
            <span className="step-number">03</span>
            <h3>{t("home.third")}</h3>
            <p>{t("home.thirdDescription")}</p>
          </li>
        </ol>
      </section>
    </div>
  );
}
