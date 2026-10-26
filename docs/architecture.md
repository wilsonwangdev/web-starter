# 架构与边界

## 标准入口

`index.html → src/main.tsx → AppProviders / InstallProvider → React Router → App`。开发和构建使用 Vite；保留官方模板的 `src`、`public`、`index.html` 入口，不维护第二个服务器或自定义项目生成器。

`/` 是可直接开始操作的首页；`/workspace` 是可替换的本地草稿示例。`draft.ts` 只管理草稿状态；偏好位于 `preferences/`，翻译位于 `i18n/`，安装生命周期位于 `pwa/`。示例不包含远端存储和自动同步。

## 元信息

`package.json` 是项目身份、版本、工具与命令的单一来源。`shared/project.ts` 显式投影可公开字段；Vite 只把这份投影注入浏览器，`src/project.ts` 提供类型入口。不要把整个清单或环境变量打包到客户端。

`build/metadata.ts` 与 `build/web-manifest.ts` 通过 Vite 原生钩子提供开发清单、构建清单和 HTML 转义；它们是项目元信息适配，不能扩展成自建构建框架。安装图标使用官方 PWA Assets Generator。

## 运行环境

应用、Node 工具和需要 DOM 的 Vite 首屏桥接分别使用 `tsconfig.app.json`、`tsconfig.node.json`、`tsconfig.vite.json`。环境类型不混用；新增构建辅助代码放进对应项目的检查范围。

外观模式由 `next-themes` 管理。HTML 中的自包含初始化函数在模块加载前设置亮暗模式，避免首屏闪烁；它只做必要的早期处理。配色、强调色、密度和语言通过验证后的偏好状态生效，颜色值集中在 CSS 设计变量中。存储失败时保留当前页面的内容并提示，损坏记录回退默认值。

## 安装范围

Web 清单、设备图标、安全区和独立窗口构成安装基础。`InstallProvider` 保存浏览器提供的一次性安装事件，只有显式点击才调用提示；取消或失败后保留手动引导，接受请求不等于已确认安装。无接口的浏览器显示菜单说明。

当前不注册 Service Worker，页面仍需联网。安装容器可能使用不同存储空间，本地草稿不承诺跨浏览器、设备或容器同步。将来加入缓存时，应先决定更新、失效、退出登录清理和敏感数据边界。

## 验证分层

Vitest 的 Node 项目验证构建与数据边界，真实浏览器项目验证组件交互；Playwright 对 `dist` 的生产预览验证路由、持久化、首屏和代表性桌面/移动浏览器。模拟设备不能替代真机安装和软键盘验收。CI 扫描源码和构建产物；运行记录留在本地或 CI，不写成模板规则。
