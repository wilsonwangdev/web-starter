import type { OxlintConfig } from "vite-plus/lint";

const developmentBoundary = {
  regex:
    "(^|/)(tests|build|tooling)(/|$)|(^|/)([^/]+\\.config\\.[^/?#]+|tsconfig[^/?#]*\\.json|package\\.json)([?#].*)?$",
  message: "浏览器源码不导入测试、构建实现、工程配置或整份项目清单。",
};

const toolchainBoundary = {
  regex:
    "^((vite-plus|vitest|playwright|vite)(/|$)|vitest-browser-react$|@(vitest|playwright|vitejs)/)",
  message: "测试与构建工具不作为浏览器运行时依赖。",
};

const projectMetadataBoundary = {
  regex: "(^|/)shared/project(\\.[^/?#]+)?([?#].*)?$",
  allowTypeImports: true,
  message: "浏览器只引用共享元信息类型；运行时从 src/project 读取构建投影。",
};

const uiPublicExportsBoundary = {
  regex: "(?:^|/)packages/ui(?:/|$)|^@web-starter/ui/src(?:/|$)",
  message: "应用通过基础组件包的公开导出消费，不穿透包源码。",
};

export const lint = {
  categories: {
    correctness: "error",
    suspicious: "error",
  },
  env: {
    browser: false,
    node: true,
  },
  plugins: ["unicorn", "typescript", "oxc", "react", "jsx-a11y", "vitest", "import"],
  options: {
    typeAware: true,
    typeCheck: true,
  },
  rules: {
    "typescript/no-explicit-any": "error",
    "typescript/no-floating-promises": "error",
    "typescript/no-misused-promises": "error",
    "typescript/no-unsafe-assignment": "error",
    "typescript/no-unsafe-argument": "error",
    "typescript/no-unsafe-call": "error",
    "typescript/no-unsafe-member-access": "error",
    "typescript/no-unsafe-return": "error",
    "react/rules-of-hooks": "error",
    "react/exhaustive-deps": "error",
    "react/react-in-jsx-scope": "off",
    "react/only-export-components": [
      "error",
      {
        allowConstantExport: true,
      },
    ],
    "import/no-cycle": [
      "error",
      {
        ignoreTypes: true,
        ignoreExternal: true,
      },
    ],
    "import/no-self-import": "error",
    "import/no-unassigned-import": "off",
    "vite-plus/prefer-vite-plus-imports": "error",
  },
  overrides: [
    {
      files: ["src/**/*.ts", "src/**/*.tsx"],
      env: {
        browser: true,
        node: false,
      },
      rules: {
        "import/no-nodejs-modules": "error",
        "no-restricted-imports": [
          "error",
          {
            patterns: [
              developmentBoundary,
              toolchainBoundary,
              projectMetadataBoundary,
              uiPublicExportsBoundary,
            ],
          },
        ],
      },
    },
    {
      files: ["tests/browser/**/*.tsx"],
      env: {
        browser: true,
        node: false,
      },
    },
    {
      files: ["tests/e2e/**/*.ts"],
      env: {
        browser: true,
        node: true,
      },
    },
    {
      files: ["shared/**/*.ts"],
      env: {
        browser: false,
        node: false,
      },
      rules: {
        "import/no-nodejs-modules": "error",
        "no-restricted-imports": [
          "error",
          {
            patterns: [
              {
                regex: "^@web-starter/ui(?:/|$)",
                message: "共享数据与纯函数不依赖基础组件包，包括仅类型引用。",
              },
              {
                message: "共享数据与纯函数不反向依赖界面、构建或测试实现。",
                regex: "(^|/)(src|build|tooling|tests)(/|$)",
              },
              {
                regex: "^(?:vite-plus/test(?:/|$)|vitest(?:/|$)|@vitest/)",
                message: "共享数据与纯函数不依赖测试运行时。",
              },
            ],
          },
        ],
      },
    },
    {
      files: ["src/app/**/*.ts", "src/app/**/*.tsx"],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            patterns: [
              developmentBoundary,
              toolchainBoundary,
              projectMetadataBoundary,
              {
                regex: "(^|/)(pages(/|$)|draft(\\.[^/]+)?(/|$))",
                message: "共享页面结构和文档元信息只依赖基础能力；页面与草稿由 App 组装。",
              },
              uiPublicExportsBoundary,
            ],
          },
        ],
      },
    },
    {
      files: ["src/pages/**/*.ts", "src/pages/**/*.tsx"],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            patterns: [
              developmentBoundary,
              toolchainBoundary,
              projectMetadataBoundary,
              {
                regex: "(^|/)(App|AppShell)(\\.[^/]+)?(/|$)",
                message: "页面通过输入和动作参与组装，不反向依赖应用入口或外壳。",
              },
              uiPublicExportsBoundary,
            ],
          },
        ],
      },
    },
    {
      files: [
        "src/i18n/**/*.ts",
        "src/i18n/**/*.tsx",
        "src/preferences/**/*.ts",
        "src/preferences/**/*.tsx",
        "src/pwa/**/*.ts",
        "src/pwa/**/*.tsx",
      ],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            patterns: [
              developmentBoundary,
              toolchainBoundary,
              projectMetadataBoundary,
              {
                regex: "(^|/)(app|pages)(/|$)|(^|/)(App|draft)(\\.[^/]+)?(/|$)",
                message: "语言、偏好与安装能力通过输入协作，不反向依赖页面、外壳或草稿业务。",
              },
              uiPublicExportsBoundary,
            ],
          },
        ],
      },
    },
    {
      files: ["packages/ui/src/**/*.ts", "packages/ui/src/**/*.tsx"],
      env: {
        browser: true,
        node: false,
      },
      rules: {
        "import/no-nodejs-modules": "error",
        "no-restricted-imports": [
          "error",
          {
            patterns: [
              developmentBoundary,
              toolchainBoundary,
              {
                regex:
                  "(?:^|/)(?:src|shared|build|tooling|tests|app|pages)(?:/|$)|^@/|^web-starter(?:/|$)",
                message: "基础组件包不反向引用应用、构建或测试实现。",
              },
            ],
          },
        ],
      },
    },
  ],
  jsPlugins: [
    {
      name: "vite-plus",
      specifier: "vite-plus/oxlint-plugin",
    },
  ],
} satisfies OxlintConfig;
