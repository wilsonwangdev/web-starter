/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly PUBLIC_PROJECT: import("../shared/project").Project;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
