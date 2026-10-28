import * as z from "zod/mini";
import useLocalStorageState from "use-local-storage-state";
import { project } from "./project";

const draftSchema = z.object({
  version: z.literal(1),
  title: z.string().check(z.maxLength(160)),
  body: z.string().check(z.maxLength(50_000)),
  updatedAt: z.nullable(z.iso.datetime()),
});
export type Draft = z.infer<typeof draftSchema>;
const emptyDraft: Draft = { version: 1, title: "", body: "", updatedAt: null };
export const draftStorageKey = `${project.storageNamespace}-draft-v1`;
const serializer = {
  parse: (value: string) => draftSchema.parse(JSON.parse(value)),
  stringify: (value: unknown) => JSON.stringify(draftSchema.parse(value)),
};
export function useDraft() {
  const [draft, setDraft, { isPersistent }] = useLocalStorageState<Draft>(draftStorageKey, {
    defaultValue: emptyDraft,
    serializer,
  });
  const updateDraft = (changes: Partial<Pick<Draft, "title" | "body">>) =>
    setDraft((current) => ({
      ...current,
      ...changes,
      updatedAt: new Date().toISOString(),
    }));
  return { draft, updateDraft, isPersistent, hasDraft: Boolean(draft.title || draft.body) };
}

export type DraftState = ReturnType<typeof useDraft>;
