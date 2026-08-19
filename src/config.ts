import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathExists } from "./fs-utils.js";
import { parseJsonc, stringifyJsonc } from "./jsonc.js";
import {
  CONFIG_FILE_NAME,
  DEFAULT_BRIDGE_SCHEMA_DIR,
  DEFAULT_PRESET,
  DEFAULT_WEB_ENTRY,
  MANIFEST_FILE_NAME,
  SCHEMA_VERSION,
  type HybridConfig,
  type ProjectManifestFile,
  type WorkspaceConfigFile,
} from "./types.js";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function loadJsoncFile(filePath: string): Promise<unknown> {
  const text = await readFile(filePath, "utf8");
  try {
    return parseJsonc(text);
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    throw new Error(`invalid JSONC: ${filePath} (${reason})`);
  }
}

export function parseWorkspaceConfig(value: unknown): WorkspaceConfigFile {
  if (!isRecord(value) || typeof value.schemaVersion !== "string") {
    throw new Error(`${CONFIG_FILE_NAME} must include string schemaVersion`);
  }
  return value as WorkspaceConfigFile;
}

export function parseProjectManifest(value: unknown): ProjectManifestFile {
  if (!isRecord(value) || typeof value.schemaVersion !== "string") {
    throw new Error(`${MANIFEST_FILE_NAME} must include string schemaVersion`);
  }
  return value as ProjectManifestFile;
}

async function writeJsoncFile(
  filePath: string,
  value: unknown,
  header: string,
): Promise<void> {
  await writeFile(filePath, stringifyJsonc(value, header), "utf8");
}

export function defaultProductConfig(preset: string): HybridConfig {
  return {
    preset: preset || DEFAULT_PRESET,
    bridgeSchemaDir: DEFAULT_BRIDGE_SCHEMA_DIR,
    webEntry: DEFAULT_WEB_ENTRY,
  };
}

export function normalizeProductConfig(value: unknown): HybridConfig | null {
  if (!isRecord(value)) return null;
  if (typeof value.preset !== "string" || !value.preset) return null;
  const bridgeSchemaDir =
    typeof value.bridgeSchemaDir === "string" && value.bridgeSchemaDir
      ? value.bridgeSchemaDir
      : DEFAULT_BRIDGE_SCHEMA_DIR;
  const webEntry =
    typeof value.webEntry === "string" && value.webEntry
      ? value.webEntry
      : DEFAULT_WEB_ENTRY;
  return {
    preset: value.preset,
    bridgeSchemaDir,
    webEntry,
  };
}

export async function writeWorkspaceConfig(
  cwd: string,
  patch: HybridConfig,
): Promise<string> {
  const configPath = path.join(cwd, CONFIG_FILE_NAME);
  const existing = (await pathExists(configPath))
    ? parseWorkspaceConfig(await loadJsoncFile(configPath))
    : { schemaVersion: SCHEMA_VERSION };
  const next: WorkspaceConfigFile = {
    ...existing,
    schemaVersion: existing.schemaVersion || SCHEMA_VERSION,
    products: {
      ...existing.products,
      hybrid: {
        preset: patch.preset,
        bridgeSchemaDir: patch.bridgeSchemaDir,
        webEntry: patch.webEntry,
      },
    },
  };
  await writeJsoncFile(
    configPath,
    next,
    "// Client Platform workspace config",
  );
  return configPath;
}

export async function writeProjectManifest(
  cwd: string,
  patch: Pick<ProjectManifestFile, "targets" | "tooling">,
): Promise<string> {
  const manifestPath = path.join(cwd, MANIFEST_FILE_NAME);
  const existing = (await pathExists(manifestPath))
    ? parseProjectManifest(await loadJsoncFile(manifestPath))
    : { schemaVersion: SCHEMA_VERSION };
  const next: ProjectManifestFile = {
    schemaVersion: existing.schemaVersion || SCHEMA_VERSION,
    targets: patch.targets ?? existing.targets,
    tooling: patch.tooling ?? existing.tooling,
  };
  await writeJsoncFile(
    manifestPath,
    next,
    "// Client Platform project manifest",
  );
  return manifestPath;
}

export type LoadedProject = {
  cwd: string;
  configPath: string;
  manifestPath: string;
  workspace: WorkspaceConfigFile;
  project: ProjectManifestFile;
  product: HybridConfig | null;
};

export async function loadProject(cwd: string): Promise<LoadedProject> {
  const configPath = path.join(cwd, CONFIG_FILE_NAME);
  const manifestPath = path.join(cwd, MANIFEST_FILE_NAME);
  if (!(await pathExists(configPath))) {
    throw new Error(`missing ${CONFIG_FILE_NAME}; run \`hybrid init\``);
  }
  if (!(await pathExists(manifestPath))) {
    throw new Error(`missing ${MANIFEST_FILE_NAME}; run \`hybrid init\``);
  }
  const workspace = parseWorkspaceConfig(await loadJsoncFile(configPath));
  return {
    cwd,
    configPath,
    manifestPath,
    workspace,
    project: parseProjectManifest(await loadJsoncFile(manifestPath)),
    product: normalizeProductConfig(workspace.products?.hybrid),
  };
}
