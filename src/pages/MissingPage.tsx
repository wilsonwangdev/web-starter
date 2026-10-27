import { ArrowRight } from "lucide-react";
import { Link } from "react-router";
import { useDocumentTitle } from "../app/useDocumentTitle";
import { useCopy } from "../i18n/useCopy";

export function MissingPage() {
  const { t } = useCopy();
  useDocumentTitle(t("missing.title"));
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
