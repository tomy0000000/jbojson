import { dirname, join } from "node:path"
import { describe, test } from "node:test"
import { strict as assert } from "node:assert"
import { fileURLToPath } from "node:url"
import { ESLint } from "eslint"

const here = dirname(fileURLToPath(import.meta.url))
const fixturesRoot = join(here, "fixtures")

const eslint = new ESLint({ ignore: false })

const cases: { fixture: string; expected: string[] }[] = [
  // Valid cases
  { fixture: "valid.json", expected: [] },

  // ESLint rules
  {
    fixture: "array-bracket-newline.json",
    expected: ["jsonc/array-bracket-newline"],
  },
  {
    fixture: "array-bracket-spacing.json",
    expected: ["jsonc/array-bracket-spacing"],
  },
  {
    fixture: "array-element-newline.json",
    expected: ["jsonc/array-element-newline"],
  },
  { fixture: "indent.json", expected: ["jsonc/indent"] },
  { fixture: "key-name-casing.json", expected: ["jsonc/key-name-casing"] },
  { fixture: "no-dupe-keys.json", expected: ["jsonc/no-dupe-keys"] },
  {
    fixture: "sort-array-values.json",
    expected: ["jsonc/sort-array-values"],
  },
  { fixture: "sort-keys.json", expected: ["jsonc/sort-keys"] },
  { fixture: "key-spacing.json", expected: ["jsonc/key-spacing"] },
  {
    fixture: "object-curly-newline.json",
    expected: ["jsonc/object-curly-newline"],
  },
  {
    fixture: "object-property-newline.json",
    expected: ["jsonc/object-property-newline"],
  },
  { fixture: "no-comments.json", expected: ["jsonc/no-comments"] },
  { fixture: "quotes.json", expected: ["jsonc/quotes"] },
  { fixture: "quote-props.json", expected: ["jsonc/quote-props"] },
  { fixture: "no-undefined-value.json", expected: ["jsonc/no-undefined-value"] },
  {
    fixture: "no-nan.json",
    expected: ["jsonc/no-nan", "jsonc/valid-json-number"],
  },
  {
    fixture: "no-infinity.json",
    expected: ["jsonc/no-infinity", "jsonc/valid-json-number"],
  },
  {
    fixture: "no-hexadecimal-numeric-literals.json",
    expected: [
      "jsonc/no-hexadecimal-numeric-literals",
      "jsonc/valid-json-number",
    ],
  },
  { fixture: "comma-dangle.json", expected: ["jsonc/comma-dangle"] },
  { fixture: "no-trailing-spaces.json", expected: ["no-trailing-spaces"] },

  // Other outliners
  { fixture: "empty-array.json", expected: [] },
  { fixture: "dollar-keys.json", expected: [] },
  { fixture: "single-item-array.json", expected: [] },
  {
    fixture: "multi-violation.json",
    expected: ["jsonc/sort-array-values", "jsonc/sort-keys"],
  },
]

describe("fixtures match expected lint output", () => {
  for (const { fixture, expected } of cases) {
    test(fixture, async () => {
      const [result] = await eslint.lintFiles([join(fixturesRoot, fixture)])
      const actual = [
        ...new Set(
          result.messages
            .map((m) => m.ruleId)
            .filter((id): id is string => !!id)
        ),
      ].sort()
      const want = [...new Set(expected)].sort()
      assert.deepEqual(
        actual,
        want,
        `expected ${JSON.stringify(want)}, got ${JSON.stringify(actual)}\nmessages: ${JSON.stringify(result.messages, null, 2)}`
      )
    })
  }
})
