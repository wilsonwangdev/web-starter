import { useEffect } from "react";
import { project } from "../project";

export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = `${title} · ${project.displayName}`;
  }, [title]);
}
