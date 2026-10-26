import type { Configuration } from "lint-staged";

// 在 --hide-all 生效期间检查待提交内容，并由工具恢复其余改动。
export default {
  "*.{ts,tsx,mts,cts}": ["oxfmt --write", "oxlint --deny-warnings"],
  "*.css": ["oxfmt --write", "stylelint --max-warnings 0"],
  "*.{json,jsonc,md,html,yaml,yml,toml}": "oxfmt --write",
  "*": () => "pnpm typecheck",
} satisfies Configuration;
