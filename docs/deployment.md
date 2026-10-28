# 部署

`pnpm build` 输出标准静态目录 `dist/`。三个平台都可托管；选择一个即可，无需为静态页面添加服务端运行时。版本与命令仍以 `package.json` 为准。

## GitHub Pages

仓库的 **Settings → Pages → Source** 选择 **GitHub Actions**，确认默认分支的 **Quality checks** 通过后，手动运行 **Deploy GitHub Pages** 工作流。工作流通过官方 `configure-pages` 获取实际路径，同时适配项目站点、用户站点和自定义域名；不会随普通提交自动上线。

Pages 无任意页面重写，因此 `build:pages` 使用 React Router 的哈希路由：任务地址为 `/<仓库名>/#/workspace`，直接打开、刷新和返回均不需要自定义 `404.html`。Vite 的 `base` 同时作用于脚本、字体、图标和安装清单。在本地验收项目子路径：

```sh
pnpm test:pages
```

更换真实仓库名时使用标准 Vite 参数 `pnpm build:pages --base /your-repository/`；域名根路径无需 `--base`。依据：[Vite 部署](https://vite.dev/guide/static-deploy#github-pages)、[React Router 哈希路由](https://reactrouter.com/api/data-routers/createHashRouter)。

## Vercel

导入 GitHub 仓库，采用仓库中的 `vercel.json`：Vite 预设、`pnpm build`、输出 `dist/`。配置中的官方 SPA 重写支持 `/workspace` 的直接访问和刷新；不要另外启用会移除 `.html` 扩展名的 `cleanUrls`。

项目环境变量设置 `ENABLE_EXPERIMENTAL_COREPACK=1`，让平台使用 `packageManager` 中的精确 pnpm；默认包管理器检测不能代替这一步，不另设 `pnpm install` 覆盖命令。Vercel 当前提供 Node 24 与 22；项目的 `engines.node` 接受经过构建验证的 24 和 26，平台可选 Node 24。开发与 CI 的精确版本仍由 `devEngines.runtime` 管理，pnpm 安装和脚本使用锁定的开发运行时，静态产物上线后不依赖 Node 服务。依据：[Vite 配置](https://vercel.com/docs/frameworks/frontend/vite#using-vite-to-make-spas)、[包管理器](https://vercel.com/docs/package-managers)、[Node 版本](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions)、[pnpm 运行时管理](https://pnpm.io/package_json#devenginesruntime)。

## Cloudflare Pages

选择 **Workers & Pages → Create → Pages → Connect to Git**，导入仓库，构建命令设为 `pnpm build`，输出目录设为 `dist`。平台环境变量 `NODE_VERSION` 使用 `package.json` 的 `devEngines.runtime.version`，`PNPM_VERSION` 使用 `packageManager` 的精确版本；升级清单时同步平台设置。Pages 不会从 `engines` 自动识别这些版本，不能直接采用构建镜像默认值，详见[构建镜像](https://developers.cloudflare.com/pages/configuration/build-image/)。

Pages 在没有顶层 `404.html` 时会按内建 SPA 规则处理 `/workspace`，不需要自定义重定向或 Worker。也可以按 [Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/) 上传 `dist/`；创建前确认需要 Git 集成还是直接上传，同一 Pages 项目不能任意切换这两种创建方式。依据：[Git 集成](https://developers.cloudflare.com/pages/get-started/git-integration/)、[SPA 规则](https://developers.cloudflare.com/pages/configuration/serving-pages/#single-page-application-spa-rendering)。

## 上线验收

平台连接和实际发布需由维护者配置。线上检查首页、任务地址直达与刷新、返回、语言与主题保存、安装清单和图标、HTTPS 及手机安全区。CI 同时检查根路径和 Pages 子路径产物；本地检查不代表已经上线或完成真机安装验收。当前不提供离线缓存或数据同步。密钥和平台凭据留在托管环境，不能通过公开的客户端变量保护。
