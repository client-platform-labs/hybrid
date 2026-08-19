export type HybridConfig = {
  preset: string;
  bridgeSchemaDir: string;
  webEntry: string;
};

export type BridgePropertyDef = {
  type: "string" | "number" | "boolean" | "object" | "array";
  description?: string;
};

export type BridgeMethodSchema = {
  schemaVersion: string;
  kind: "method";
  name: string;
  params?: Record<string, BridgePropertyDef>;
  result?: BridgePropertyDef;
};

export type BridgeEventSchema = {
  schemaVersion: string;
  kind: "event";
  name: string;
  payload?: Record<string, BridgePropertyDef>;
};

export type BridgeSchema = BridgeMethodSchema | BridgeEventSchema;

export type WorkspaceConfigFile = {
  schemaVersion: string;
  products?: {
    hybrid?: Partial<HybridConfig> & Record<string, unknown>;
    [product: string]: unknown;
  };
  plugins?: string[];
};

export type ProjectManifestFile = {
  schemaVersion: string;
  targets?: string[];
  tooling?: string[];
};

export const CONFIG_FILE_NAME = "client-platform.config.jsonc";
export const MANIFEST_FILE_NAME = "client-platform.manifest.jsonc";
export const SCHEMA_VERSION = "1";
export const DEFAULT_PRESET = "webview-react-vite";
export const DEFAULT_BRIDGE_SCHEMA_DIR = "hybrid/bridge";
export const DEFAULT_WEB_ENTRY = "./src/main.tsx";
export const GENERATED_DIR = "hybrid/generated";
export const PREVIEW_DIR = ".client-platform/hybrid/preview";
