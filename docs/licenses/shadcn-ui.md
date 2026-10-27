# shadcn/ui 源码来源

`packages/ui/src/components/` 中的 Button、Select 和 Dialog 由官方 shadcn `radix-nova` 注册表生成。行为由 Radix 提供，图标使用 Lucide；基础组件通过本仓库的私有源码包 `@web-starter/ui` 消费。

- 上游：[shadcn/ui](https://github.com/shadcn-ui/ui)，[MIT 许可原文](shadcn-ui-MIT.txt)。
- 注册表：<https://ui.shadcn.com/r/styles/radix-nova/>。
- 根目录和组件包分别维护 `components.json`；版本由各自 `package.json` 锁定。

本地适配包括 `ui:` 前缀、类型和相对导入、按钮变体的内部模块、默认 `type="button"`，以及由调用方提供翻译的可选弹窗关闭按钮。组件样式映射本仓库的语义变量，主题值留在 `src/design-tokens.css`，不启用整站 Preflight。

从根目录运行 `pnpm exec shadcn add <组件> --diff` 查看上游差异。覆盖更新会替换本地适配，应先审查再应用。
