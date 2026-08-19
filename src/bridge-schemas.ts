import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import type {
  BridgeEventSchema,
  BridgeMethodSchema,
  BridgePropertyDef,
  BridgeSchema,
} from "./types.js";

export type LoadedBridgeSchema = {
  file: string;
  schema: BridgeSchema;
};

export type BridgeLoadIssue = {
  file: string;
  message: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPropertyDef(value: unknown): value is BridgePropertyDef {
  if (!isRecord(value)) return false;
  return (
    value.type === "string" ||
    value.type === "number" ||
    value.type === "boolean" ||
    value.type === "object" ||
    value.type === "array"
  );
}

function parseProps(
  value: unknown,
): Record<string, BridgePropertyDef> | undefined {
  if (!isRecord(value)) return undefined;
  const out: Record<string, BridgePropertyDef> = {};
  for (const [key, def] of Object.entries(value)) {
    if (isPropertyDef(def)) out[key] = def;
  }
  return out;
}

function parseSchema(value: unknown, file: string): BridgeSchema {
  if (!isRecord(value)) {
    throw new Error(`${file}: must be a JSON object`);
  }
  if (value.schemaVersion !== "1") {
    throw new Error(`${file}: schemaVersion must be "1"`);
  }
  if (typeof value.name !== "string" || !value.name) {
    throw new Error(`${file}: name must be a non-empty string`);
  }
  if (value.kind === "method") {
    const schema: BridgeMethodSchema = {
      schemaVersion: "1",
      kind: "method",
      name: value.name,
      params: parseProps(value.params),
      result: isPropertyDef(value.result) ? value.result : undefined,
    };
    return schema;
  }
  if (value.kind === "event") {
    const schema: BridgeEventSchema = {
      schemaVersion: "1",
      kind: "event",
      name: value.name,
      payload: parseProps(value.payload),
    };
    return schema;
  }
  throw new Error(`${file}: kind must be "method" or "event"`);
}

async function walkJsonFiles(dir: string): Promise<string[]> {
  const out: string[] = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...(await walkJsonFiles(full)));
    } else if (entry.isFile() && entry.name.endsWith(".json")) {
      out.push(full);
    }
  }
  return out;
}

export async function loadBridgeSchemas(
  cwd: string,
  bridgeSchemaDir: string,
): Promise<{ schemas: LoadedBridgeSchema[]; issues: BridgeLoadIssue[] }> {
  const root = path.join(cwd, bridgeSchemaDir);
  const files = await walkJsonFiles(root);
  const schemas: LoadedBridgeSchema[] = [];
  const issues: BridgeLoadIssue[] = [];

  for (const file of files) {
    const base = path.basename(file);
    const rel = path.relative(cwd, file);
    try {
      const raw = JSON.parse(await readFile(file, "utf8")) as unknown;
      const schema = parseSchema(raw, rel);
      if (schema.kind === "method" && !base.startsWith("method.")) {
        issues.push({
          file: rel,
          message: `method schema filename should start with method. (got ${base})`,
        });
      }
      if (schema.kind === "event" && !base.startsWith("event.")) {
        issues.push({
          file: rel,
          message: `event schema filename should start with event. (got ${base})`,
        });
      }
      schemas.push({ file: rel, schema });
    } catch (err) {
      issues.push({
        file: rel,
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return { schemas, issues };
}
