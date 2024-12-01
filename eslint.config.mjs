// @ts-check
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import vitest from "@vitest/eslint-plugin";

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  vitest.configs.recommended,
  {
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "all",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
    },
  },
);
