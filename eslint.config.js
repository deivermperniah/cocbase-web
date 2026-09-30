import pluginVue from "eslint-plugin-vue";
import { defineConfigWithVueTs, vueTsConfigs } from "@vue/eslint-config-typescript";
import skipFormatting from "eslint-config-prettier";
import globals from "globals";

export default defineConfigWithVueTs(
  { ignores: ["dist/**", "node_modules/**", "public/**"] },
  pluginVue.configs["flat/recommended"],
  vueTsConfigs.recommended,
  {
    languageOptions: { globals: { ...globals.browser } },
    rules: {
      "vue/multi-word-component-names": "off",
      "vue/require-default-prop": "off",
      "no-console": ["warn", { allow: ["error", "warn"] }],
    },
  },
  {
    files: ["scripts/**", "*.config.{js,ts}", ".puppeteerrc.cjs"],
    languageOptions: { globals: { ...globals.node } },
    rules: { "@typescript-eslint/no-require-imports": "off", "no-console": "off" },
  },
  skipFormatting,
);
