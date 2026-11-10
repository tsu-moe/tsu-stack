import { type FormatConfig } from "vite-plus/fmt";

type BaseFormatOptionsInput = {
  scope?: string;
  sortTailwindcss?: boolean;
};

export function getBaseFormatOptions({
  scope = "@tsu-stack",
  sortTailwindcss = true
}: BaseFormatOptionsInput = {}): FormatConfig {
  return {
    printWidth: 120,
    sortImports: {
      customGroups: [
        {
          elementNamePattern: [`${scope}/**`],
          groupName: "workspace"
        },
        {
          elementNamePattern: ["@/pages/**"],
          groupName: "pages"
        },
        {
          elementNamePattern: ["@/widgets/**"],
          groupName: "widgets"
        },
        {
          elementNamePattern: ["@/features/**"],
          groupName: "features"
        },
        {
          elementNamePattern: ["@/entities/**"],
          groupName: "entities"
        },
        {
          elementNamePattern: ["@/shared/**"],
          groupName: "shared"
        }
      ],
      groups: [
        "builtin",
        "external",
        "workspace",
        "shared",
        "entities",
        "features",
        "widgets",
        "pages",
        ["internal", "subpath"],
        ["parent", "sibling", "index"],
        "style",
        "unknown"
      ],
      internalPattern: ["@/", "#@/", "~/", "~~/", "#"],
      sortSideEffects: true
    },
    sortPackageJson: true,
    sortTailwindcss: sortTailwindcss
      ? {
          attributes: ["class", "className"],
          functions: ["clsx", "cn", "cva", "tw"],
          stylesheet: "./packages/ui/styles/globals.css"
        }
      : false,
    trailingComma: "none"
  };
}
