import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint-define-config";

export default defineConfig([
  { files: ["**/*.{js,mjs,cjs,ts}"] },
  {
    root: true,
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
]);
