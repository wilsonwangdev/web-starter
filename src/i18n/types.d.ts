import type { zhCN } from "./resources";
declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "translation";
    returnNull: false;
    resources: { translation: typeof zhCN };
  }
}
