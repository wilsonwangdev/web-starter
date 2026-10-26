import manifest from "../package.json" with { type: "json" };

// 只投影界面需要的元信息，工具与依赖配置不进入浏览器。
export const project = {
  name: manifest.name,
  version: manifest.version,
  description: manifest.description,
  ...manifest.product,
};

export type Project = typeof project;
