# 贡献

从主题分支开始，通过 PR 合入 `main`。保持一次改动聚焦一个问题，升级依赖同时更新锁文件。

```sh
pnpm install --frozen-lockfile
pnpm exec playwright install chromium webkit
pnpm check
```

Linux 首次安装浏览器可加 `--with-deps`。`pnpm fmt` 修正格式；命令和版本以 `package.json` 为准。

安装依赖会启用 Husky。提交前检查暂存内容的代码、样式、格式与完整项目类型；CI 另外运行 Node、真实浏览器与生产构建验收。不要跳过钩子来绕过错误。

界面改动遵循[设计约定](docs/design.md)，基础能力先读[架构](docs/architecture.md)。新增行为补有意义的验证，不为机械常量编写重复测试。

凭据、本机路径、真实用户数据和运行报告留在被忽略的本地文件中；公共说明与用例保持可复用。密钥不能通过浏览器环境变量保护。
