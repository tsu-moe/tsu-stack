import { type OxlintOverride } from "vite-plus/lint";

const WEB_SHARED_FSD_OPTIONS = {
  rootPath: "/apps/web/src/",
  tsconfigPath: "./apps/web/tsconfig.json",
  alias: { value: "@", withSlash: true },
  layers: {
    app: { pattern: "routes" },
    pages: { pattern: "pages" },
    widgets: { pattern: "widgets" },
    features: { pattern: "features" },
    entities: { pattern: "entities" },
    shared: { pattern: "shared" }
  },
  ignoreImportPatterns: ["\\.css$"]
};

export const tanstackStartFsdLint = {
  jsPlugins: [{ name: "fsd", specifier: "eslint-plugin-fsd-lint" }],
  rules: {
    "fsd/forbidden-imports": [
      "error",
      { ...WEB_SHARED_FSD_OPTIONS, alias: { value: "@", withSlash: false } }
    ],
    "fsd/no-relative-imports": [
      "error",
      {
        ...WEB_SHARED_FSD_OPTIONS,
        allowSameSlice: true
      }
    ],
    "fsd/no-public-api-sidestep": ["error", WEB_SHARED_FSD_OPTIONS],
    "fsd/no-cross-slice-dependency": [
      "error",
      {
        ...WEB_SHARED_FSD_OPTIONS,
        allowTypeImports: false,
        excludeLayers: ["shared"],
        featuresOnly: false
      }
    ],
    "fsd/no-ui-in-business-logic": ["error", WEB_SHARED_FSD_OPTIONS],
    "fsd/no-global-store-imports": "error"
  }
} satisfies Omit<OxlintOverride, "files">;
