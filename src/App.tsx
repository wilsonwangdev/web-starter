import type { ReactNode } from "react";
import { Route, Routes } from "react-router";
import { AppShell } from "./app/AppShell";
import { useDraft } from "./draft";
import { HomePage } from "./pages/HomePage";
import { MissingPage } from "./pages/MissingPage";
import { WorkspacePage } from "./pages/WorkspacePage";
import "./App.css";

export default function App({ extraSettings }: { extraSettings?: ReactNode }) {
  const { draft, updateDraft, isPersistent, hasDraft } = useDraft();
  return (
    <AppShell extraSettings={extraSettings}>
      <Routes>
        <Route path="/" element={<HomePage hasDraft={hasDraft} extraSettings={extraSettings} />} />
        <Route
          path="/workspace"
          element={
            <WorkspacePage draft={draft} updateDraft={updateDraft} isPersistent={isPersistent} />
          }
        />
        <Route path="*" element={<MissingPage />} />
      </Routes>
    </AppShell>
  );
}
