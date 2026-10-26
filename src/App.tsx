import { useEffect, type ReactNode } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Asterisk,
  Check,
  Circle,
  PenLine,
  Settings2,
} from "lucide-react";
import { Link, NavLink, Route, Routes, ScrollRestoration, useMatch } from "react-router";
import { useDraft } from "./draft";
import { useCopy } from "./i18n/useCopy";
import { PreferencesDialog } from "./preferences/PreferencesDialog";
import { project } from "./project";
import "./App.css";

type DraftState = ReturnType<typeof useDraft>;

export default function App({ extraSettings }: { extraSettings?: ReactNode }) {
  const { t } = useCopy();
  const draftState = useDraft();
  const workspaceMatch = useMatch("/workspace");
  const homeMatch = useMatch("/");
  const pageTitle = workspaceMatch
    ? t("nav.workspace")
    : homeMatch
      ? t("nav.home")
      : t("missing.title");
  useEffect(() => {
    document.title = `${pageTitle} · ${project.displayName}`;
  }, [pageTitle]);
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
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
          <button
            className="icon-button preferences-trigger"
            type="button"
            aria-label={t("nav.preferences")}
          >
            <Settings2 aria-hidden="true" />
          </button>
        </PreferencesDialog>
      </header>
      <main id="main" className="main-content" tabIndex={-1}>
        <Routes>
          <Route
            path="/"
            element={<Home hasDraft={draftState.hasDraft} extraSettings={extraSettings} />}
          />
          <Route path="/workspace" element={<Workspace {...draftState} />} />
          <Route path="*" element={<Missing />} />
        </Routes>
      </main>
      <footer className="site-footer page-width">
        <span>{project.displayName}</span>
        <p>{t("footer.local")}</p>
      </footer>
      <ScrollRestoration />
    </div>
  );
}

function Home({ hasDraft, extraSettings }: { hasDraft: boolean; extraSettings?: ReactNode }) {
  const { t } = useCopy();
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

function Workspace({ draft, updateDraft, isPersistent }: DraftState) {
  const { t, formatDate } = useCopy();
  const status = !isPersistent
    ? t("workspace.temporary")
    : draft.updatedAt
      ? t("workspace.saved", { time: formatDate(draft.updatedAt) })
      : t("workspace.empty");
  return (
    <section className="workspace page-width" aria-labelledby="workspace-title">
      <div className="workspace-heading">
        <p className="eyebrow">{t("workspace.eyebrow")}</p>
        <h1 id="workspace-title">{t("workspace.title")}</h1>
        <p>{t("workspace.description")}</p>
      </div>
      <div className="draft-sheet">
        <label className="field-label" htmlFor="draft-title">
          {t("workspace.name")}
        </label>
        <input
          id="draft-title"
          className="draft-title"
          value={draft.title}
          maxLength={160}
          placeholder={t("workspace.namePlaceholder")}
          onChange={(event) => updateDraft({ title: event.target.value })}
        />
        <div className="draft-divider" />
        <label className="field-label" htmlFor="draft-body">
          {t("workspace.body")}
        </label>
        <textarea
          id="draft-body"
          className="draft-body"
          value={draft.body}
          maxLength={50_000}
          placeholder={t("workspace.bodyPlaceholder")}
          onChange={(event) => updateDraft({ body: event.target.value })}
        />
        <div className="draft-bottom">
          <output className="draft-status">
            {isPersistent && draft.updatedAt ? (
              <Check aria-hidden="true" />
            ) : (
              <Circle aria-hidden="true" />
            )}
            {status}
          </output>
          <span className="character-count">
            {t("workspace.words", { count: Array.from(draft.body).length })}
          </span>
        </div>
      </div>
      <p className="workspace-privacy">{t("workspace.privacy")}</p>
    </section>
  );
}

function Missing() {
  const { t } = useCopy();
  return (
    <section className="missing-page page-width">
      <p className="eyebrow">404</p>
      <h1>{t("missing.title")}</h1>
      <p>{t("missing.description")}</p>
      <Link className="button button-primary" to="/">
        {t("common.backHome")}
        <ArrowRight aria-hidden="true" />
      </Link>
    </section>
  );
}
