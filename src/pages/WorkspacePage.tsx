import { Check, Circle } from "lucide-react";
import { useDocumentTitle } from "../app/useDocumentTitle";
import type { DraftState } from "../draft";
import { useCopy } from "../i18n/useCopy";

type WorkspacePageProps = Pick<DraftState, "draft" | "updateDraft" | "isPersistent">;

export function WorkspacePage({ draft, updateDraft, isPersistent }: WorkspacePageProps) {
  const { t, formatDate } = useCopy();
  useDocumentTitle(t("nav.workspace"));
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
