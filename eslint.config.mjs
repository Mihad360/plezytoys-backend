import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import prettierConfig from "eslint-config-prettier";
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

export default [
  {
    ignores: ["**/node_modules/", ".dist/"],
    languageOptions: {
      globals: {
        ...globals.browser,
        process: "readonly",
      },
    },
    rules: {
      "no-unused-vars": "error",
      "no-unused-expressions": "error",
      "prefer-const": "error",
      "no-console": "warn",
      "no-undef": "error",
    },
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-empty-object-type": "warn",
      "no-console": "warn",
      "no-unused-vars": "off",
      "no-undef": "off",
    },
  },
];


