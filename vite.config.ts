import { defineConfig } from "vite-plus";

/**
 * Defines top-level Vite+ configurations for the different tools in its ecosystem.
 * @see {@link https://viteplus.dev/config}
 */
export default defineConfig({
  // Commit hooks - https://viteplus.dev/guide/commit-hooks
  staged: {
    "*": "vp check --fix",
  },

  // Vitest - https://vitest.dev/config
  test: {
    include: ["**/*.test.ts"],
  },

  // Oxfmt - https://oxc.rs/docs/guide/usage/formatter/config.html
  fmt: {
    ignorePatterns: [
      "pnpm-lock.yaml",
      "package-lock.json",
      "yarn.lock",
      "bun.lock",
      "routeTree.gen.ts",
      ".tanstack-start/",
      ".tanstack/",
      "drizzle/",
      "migrations/",
      ".drizzle/",
      ".cache",
      "worker-configuration.d.ts",
      ".vercel",
      ".output",
      ".wrangler",
      ".netlify",
      "dist",
    ],
    sortImports: {
      customGroups: [
        {
          elementNamePattern: ["@tsu-stack/**"],
          groupName: "@tsu-stack",
        },
      ],
      groups: [
        "builtin",
        "external",
        "@tsu-stack",
        ["internal", "subpath"],
        ["parent", "sibling", "index"],
        "style",
        "unknown",
      ],
      internalPattern: ["@/", "#@/", "~/", "~~/", "#"],
      sortSideEffects: true,
    },
    sortPackageJson: true,
    sortTailwindcss: {
      attributes: ["class", "className"],
      functions: ["clsx", "cn", "cva", "tw"],
      stylesheet: "./packages/ui/styles/globals.css",
    },
  },

  // Oxlint - https://oxc.rs/docs/guide/usage/linter/config
  lint: {
    env: {
      browser: true,
      builtin: true,
      node: true,
    },
    ignorePatterns: [
      "dist",
      ".wrangler",
      ".vercel",
      ".netlify",
      ".output",
      "build/",
      "worker-configuration.d.ts",
      "scripts/",
    ],
    jsPlugins: [
      { name: "react-hooks-js", specifier: "eslint-plugin-react-hooks" },
      /**
       * FIXME: Plugins with "/" in name have to be aliased for now
       * @see {@link https://github.com/oxc-project/oxc/issues/14557}
       */
      {
        name: "eslint-tanstack-router",
        specifier: "@tanstack/eslint-plugin-router",
      },
      {
        name: "eslint-tanstack-query",
        specifier: "@tanstack/eslint-plugin-query",
      },
    ],
    options: { typeAware: true, typeCheck: true },
    plugins: [
      "eslint",
      "react",
      "react-perf",
      "jsx-a11y",
      "typescript",
      "import",
      "promise",
      "jest",
      "unicorn",
    ],

    rules: {
      // Tanstack Router rules, ref: https://tanstack.com/router/latest/docs/eslint/eslint-plugin-router
      "eslint-tanstack-router/create-route-property-order": "error",
      // Tanstack Query rules, ref: https://tanstack.com/query/latest/docs/eslint/eslint-plugin-query
      "eslint-tanstack-query/exhaustive-deps": "error",
      "eslint-tanstack-query/no-rest-destructuring": "error",
      "eslint-tanstack-query/stable-query-client": "error",
      "eslint-tanstack-query/no-unstable-deps": "error",
      "eslint-tanstack-query/infinite-query-property-order": "error",
      "eslint-tanstack-query/no-void-query-fn": "warn",
      "eslint-tanstack-query/mutation-property-order": "error",
      "eslint-tanstack-query/prefer-query-options": "warn",

      // Recommended rules (from LintRulePreset.Recommended)
      // ref: https://github.com/TheAlexLichter/oxlint-react-compiler-rules/issues/1
      "react-hooks-js/component-hook-factories": "error",
      "react-hooks-js/config": "error",
      "react-hooks-js/error-boundaries": "error",
      "react-hooks-js/gating": "error",
      "react-hooks-js/globals": "error",
      "react-hooks-js/immutability": "error",
      "react-hooks-js/incompatible-library": "error",
      "react-hooks-js/preserve-manual-memoization": "error",
      "react-hooks-js/purity": "error",
      "react-hooks-js/refs": "error",
      "react-hooks-js/set-state-in-effect": "warn",
      "react-hooks-js/set-state-in-render": "error",
      "react-hooks-js/static-components": "error",
      "react-hooks-js/unsupported-syntax": "error",
      "react-hooks-js/use-memo": "error",

      // Recommended-latest rules (from LintRulePreset.RecommendedLatest)
      "react-hooks-js/void-use-memo": "error",

      // Off rules (LintRulePreset.Off) - not enabled by default
      "react-hooks-js/automatic-effect-dependencies": "off",
      "react-hooks-js/capitalized-calls": "off",
      "react-hooks-js/fbt": "off",
      "react-hooks-js/fire": "off",
      "react-hooks-js/hooks": "off",
      "react-hooks-js/invariant": "off",
      "react-hooks-js/memoized-effect-dependencies": "off",
      "react-hooks-js/no-deriving-state-in-effects": "off",
      "react-hooks-js/rule-suppression": "off",
      "react-hooks-js/syntax": "off",
      "react-hooks-js/todo": "off",
      // You can add more rules from: https://oxc.rs/docs/guide/usage/linter/rules.html?sort=fix&dir=asc&has_fix=true
      "arrow-body-style": [
        "error",
        "as-needed",
        { requireReturnForObjectLiteral: true },
      ],
      "ban-ts-comment": "error",
      "consistent-indexed-object-style": ["error", "record"],
      "consistent-test-it": ["error", { fn: "it" }],
      "consistent-type-definitions": ["error", "type"],
      "consistent-type-imports": [
        "error",
        { fixStyle: "inline-type-imports", prefer: "type-imports" },
      ],
      "consistent-type-specifier-style": ["error", "prefer-inline"],
      curly: ["error", "multi-line"],
      "escape-case": "warn",
      "explicit-length-check": "warn",
      "jsx-fragments": ["error", "syntax"],
      "jsx-props-no-spread-multi": "error",
      "no-aria-hidden-on-focusable": "error",
      "no-array-reverse": "warn",
      "no-array-sort": "warn",
      "no-console": ["warn", { allow: ["debug"] }],
      "no-else-return": "error",
      "no-explicit-any": [
        "error",
        { fixToUnknown: true, ignoreRestArgs: true },
      ],
      "no-new-statics": "error",
      "no-redundant-roles": "error",
      "no-relative-parent-imports": "error",
      "no-var": "warn",
      "prefer-array-flat-map": "error",
      "prefer-const": "warn",
      "prefer-nullish-coalescing": "error",
      "prefer-object-spread": "error",
      "prefer-spread": "warn",
      "switch-case-braces": ["error", "avoid"],
      "switch-exhaustiveness-check": "error",
      "throw-new-error": "error",
      "valid-title": "error",
      yoda: "warn",
    },
  },
});
