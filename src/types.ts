export type HybridConfig = {
  preset: string;
  shell?: string;
};

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
  entry?: string;
};

export const CONFIG_FILE_NAME = "client-platform.config.jsonc";
export const MANIFEST_FILE_NAME = "client-platform.manifest.jsonc";
export const SCHEMA_VERSION = "0";
export const DEFAULT_PRESET = "webview-react-vite";
export const DEFAULT_SHELL = "webview";
