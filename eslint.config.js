import { defineConfig } from "eslint/config"
import jsonc from "eslint-plugin-jsonc"

export default defineConfig([
  { ignores: ["test/fixtures/**"] },
  ...jsonc.configs["flat/recommended-with-json"],
  {
    files: ["data/**/*.json", "schema/**/*.json", "test/fixtures/*.json"],
    rules: {
      "jsonc/array-bracket-newline": [
        "error",
        { multiline: true, minItems: 1 },
      ],
      "jsonc/array-bracket-spacing": ["error", "never"],
      "jsonc/array-element-newline": ["error", "always"],
      "jsonc/indent": ["error", 2],
      "jsonc/key-name-casing": "error",
      "jsonc/key-spacing": "error",
      "jsonc/object-curly-newline": ["error", "always"],
      "jsonc/object-property-newline": "error",
      "jsonc/sort-array-values": [
        "error",
        {
          pathPattern: ".*",
          order: { type: "asc" },
        },
      ],
      "jsonc/sort-keys": "error",
      "no-trailing-spaces": "error",
    },
  },
])
