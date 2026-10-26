# 可选部署

`pnpm build` 生成标准静态目录 `dist/`，可托管到支持 HTTPS 的静态服务。当前使用域名根路径和浏览器路由：主机需对不存在的页面导航返回 `index.html`，同时正常提供图标、字体与清单资源。

## Cloudflare Pages

无需把 Cloudflare 运行时加入应用。按[官方 Direct Upload 指南](https://developers.cloudflare.com/pages/get-started/direct-upload/)上传已经构建的目录：

```sh
pnpm build
pnpm dlx wrangler login
pnpm dlx wrangler pages deploy dist
```

CLI 会引导选择或创建 Pages 项目。远端资源名称由部署环境管理，不复制成应用元信息。首次选用 Direct Upload 前，确认不需要同一个 Pages 项目后续切换 Git 集成；两种项目创建方式的限制见官方说明。长期维护自动部署时，在派生项目精确安装 Wrangler 并通过 PR 维护锁文件与发布流程。

Pages 在没有顶层 `404.html` 时会按[单页应用规则](https://developers.cloudflare.com/pages/configuration/serving-pages/#single-page-application-spa-rendering)回退页面导航。若选用 Workers Static Assets，则按其[单页应用配置](https://developers.cloudflare.com/workers/static-assets/routing/single-page-application/)启用 `assets.not_found_handling`，不必为静态页面新增 Worker 业务代码。

## 上线验收

确认 `/`、直接访问 `/workspace`、刷新和返回均可用；检查清单 MIME、设备图标、HTTPS、手机安全区和软键盘。安装提示是否出现由浏览器决定，需实际设备验证；当前不提供离线缓存或数据同步。此模板的本地预览不代表已部署或完成真机验收。

密钥、平台账号和部署权限由目标环境提供，不提交到仓库，也不通过公开的客户端变量传递。
