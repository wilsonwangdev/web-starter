import { zhCN } from "./locales/zh-CN.ts";
import { en } from "./locales/en.ts";

export { zhCN, en };
export type { TranslationMessages as EnglishCopy } from "./schema.ts";

export const resources = { "zh-CN": { translation: zhCN }, en: { translation: en } };
