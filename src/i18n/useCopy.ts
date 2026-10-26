import { useTranslation } from "react-i18next";
export function useCopy() {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage === "en" ? "en" : "zh-CN";
  const formatDate = (value: string) =>
    new Intl.DateTimeFormat(locale, {
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(value));
  return { t, locale, formatDate };
}
