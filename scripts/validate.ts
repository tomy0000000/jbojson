import { readdir, readFile } from "node:fs/promises"
import { createRequire } from "node:module"
import { basename, dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { Ajv, type ErrorObject, type ValidateFunction } from "ajv"

const require = createRequire(import.meta.url)
const addFormats = require("ajv-formats") as (ajv: Ajv) => Ajv

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const schemaDir = join(repoRoot, "schema")
const dataDir = join(repoRoot, "data")

function formatError(err: ErrorObject): string {
  const path = err.instancePath || "/"
  return `${path} ${err.message ?? "invalid"}`
}

function report(type: string, file: string, errors: string[]): boolean {
  if (errors.length === 0) {
    console.log(`✅ [${type}] ${file}`)
    return true
  }
  console.error(`❌ [${type}] ${file}`)
  for (const msg of errors) {
    console.error(`   ${msg}`)
  }
  return false
}

async function validateFile(
  dataPath: string,
  validate: ValidateFunction,
  type: string
): Promise<boolean> {
  const file = basename(dataPath)

  let parsed: unknown
  try {
    parsed = JSON.parse(await readFile(dataPath, "utf8"))
  } catch (err) {
    return report(type, file, [`parse error: ${(err as Error).message}`])
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return report(type, file, ["data root must be an object"])
  }

  if (validate(parsed)) {
    return report(type, file, [])
  }

  return report(type, file, (validate.errors ?? []).map(formatError))
}

async function main(): Promise<void> {
  const ajv = new Ajv({ allErrors: true, strict: false })
  addFormats(ajv)

  const types = (await readdir(dataDir, { withFileTypes: true }))
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort()

  const tasks: Array<Promise<boolean>> = []
  for (const type of types) {
    const schemaPath = join(schemaDir, `${type}.json`)
    const schema = JSON.parse(await readFile(schemaPath, "utf8"))
    const validate = ajv.compile(schema)

    const typeDir = join(dataDir, type)
    const files = (await readdir(typeDir))
      .filter((f) => f.endsWith(".json"))
      .sort()
    for (const file of files) {
      tasks.push(validateFile(join(typeDir, file), validate, type))
    }
  }

  const outcomes = await Promise.all(tasks)
  if (outcomes.some((ok) => !ok)) process.exit(1)
}

await main()
