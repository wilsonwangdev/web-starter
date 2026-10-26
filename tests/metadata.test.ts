import { afterEach, describe, expect, it } from "vitest";
import { build, createServer } from "vite";
import type { ViteDevServer } from "vite";
import manifest from "../package.json" with { type: "json" };
import { htmlText, manifestAsset } from "../build/metadata.ts";
import { webManifest } from "../build/web-manifest.ts";
import { project } from "../shared/project.ts";

describe("公开项目元信息", () => {
  it("跟随项目清单，并排除工具和依赖配置", () => {
    expect(project).toEqual({
      name: manifest.name,
      version: manifest.version,
      description: manifest.description,
      ...manifest.product,
    });
    expect(project).not.toHaveProperty("scripts");
    expect(project).not.toHaveProperty("dependencies");
    expect(project).not.toHaveProperty("devDependencies");
    expect(project).not.toHaveProperty("devEngines");
    expect(project).not.toHaveProperty("config");
  });

  it("安装清单复用同一份身份和外观信息", () => {
    expect(webManifest).toMatchObject({
      name: project.displayName,
      short_name: project.displayName,
      description: project.description,
      lang: project.locale,
      theme_color: project.themeColor,
      background_color: project.themeColor,
      display: "standalone",
      start_url: "/",
      scope: "/",
    });
    expect(webManifest.icons).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ sizes: "192x192", purpose: "any" }),
        expect.objectContaining({ sizes: "512x512", purpose: "maskable" }),
      ]),
    );
  });

  it("由 Vite 输出可解析的清单文件", async () => {
    const result = await build({
      configFile: false,
      logLevel: "silent",
      publicDir: false,
      plugins: [
        {
          name: "metadata-test-entry",
          resolveId(id) {
            if (id === "virtual:metadata-test") return "\0virtual:metadata-test";
            return null;
          },
          load(id) {
            if (id === "\0virtual:metadata-test") return "export const ready = true;";
            return null;
          },
        },
        manifestAsset(),
      ],
      build: { write: false, rolldownOptions: { input: "virtual:metadata-test" } },
    });
    const bundles = Array.isArray(result) ? result : [result];
    const asset = bundles
      .flatMap((bundle) => ("output" in bundle ? bundle.output : []))
      .find((output) => output.fileName === "manifest.webmanifest");

    expect(asset?.type).toBe("asset");
    if (asset?.type !== "asset") throw new Error("未生成安装清单");
    const source =
      typeof asset.source === "string" ? asset.source : Buffer.from(asset.source).toString("utf8");
    expect(JSON.parse(source)).toEqual(webManifest);
  });
});

describe("开发服务器的安装清单", () => {
  let server: ViteDevServer | undefined;

  afterEach(async () => {
    await server?.close();
  });

  it("支持读取和 HEAD，拒绝写入，并保留其他请求的处理链", async () => {
    server = await createServer({
      configFile: false,
      logLevel: "silent",
      publicDir: false,
      server: { host: "127.0.0.1", port: 0 },
      plugins: [
        manifestAsset(),
        {
          name: "metadata-test-fallback",
          configureServer(currentServer) {
            currentServer.middlewares.use((_request, response) => {
              response.end("next-handler");
            });
          },
        },
      ],
    });
    await server.listen();
    const address = server.httpServer?.address();
    if (!address || typeof address === "string") throw new Error("测试服务器未监听本地端口");
    const baseUrl = `http://127.0.0.1:${address.port}`;

    const read = await fetch(`${baseUrl}/manifest.webmanifest?cache-test=1`);
    expect(read.status).toBe(200);
    expect(read.headers.get("content-type")).toBe("application/manifest+json");
    expect(read.headers.get("cache-control")).toBe("no-cache");
    expect(await read.json()).toEqual(webManifest);

    const head = await fetch(`${baseUrl}/manifest.webmanifest`, { method: "HEAD" });
    expect(head.status).toBe(200);
    expect(head.headers.get("content-type")).toBe("application/manifest+json");
    expect(await head.text()).toBe("");

    const write = await fetch(`${baseUrl}/manifest.webmanifest`, { method: "POST" });
    expect(write.status).toBe(405);
    expect(write.headers.get("allow")).toBe("GET, HEAD");
    expect(await write.text()).toBe("");

    const other = await fetch(`${baseUrl}/manifest.webmanifest-extra`);
    expect(await other.text()).toBe("next-handler");
  });
});

describe("HTML 元信息转义", () => {
  it.each([
    ["起点 · Start 🚀", "起点 · Start 🚀"],
    ["&<>\"'", "&amp;&lt;&gt;&quot;&#39;"],
    ["&lt;already-escaped&gt;", "&amp;lt;already-escaped&amp;gt;"],
    [
      '"><script>alert("test")</script>',
      "&quot;&gt;&lt;script&gt;alert(&quot;test&quot;)&lt;/script&gt;",
    ],
  ])("把 %s 作为文本保留", (input, expected) => {
    expect(htmlText(input)).toBe(expected);
  });
});
