import {
  ConfigError,
  loadProjectManifest,
  loadWorkspaceConfig,
  PROJECT_MANIFEST_FILENAME,
  WORKSPACE_CONFIG_FILENAME,
} from "@client-platform/kernel";
import { loadBridgeSchemas } from "./bridge-schemas.js";
import { normalizeProductConfig } from "./config.js";

export type ValidateResult = {
  ok: boolean;
  checks: string[];
  errors: string[];
  warnings: string[];
};

export async function runValidate(cwd: string): Promise<ValidateResult> {
  const checks: string[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const workspace = await loadWorkspaceConfig(cwd);
    checks.push(
      `loaded ${WORKSPACE_CONFIG_FILENAME} (schemaVersion=${workspace.schemaVersion})`,
    );

    const manifest = await loadProjectManifest(cwd);
    checks.push(
      `loaded ${PROJECT_MANIFEST_FILENAME} (schemaVersion=${manifest.schemaVersion})`,
    );

    const product = normalizeProductConfig(workspace.products?.hybrid);
    if (!product) {
      errors.push(
        "products.hybrid missing or invalid (need preset, bridgeSchemaDir, webEntry)",
      );
      return { ok: false, checks, errors, warnings };
    }

    checks.push(`preset=${product.preset}`);
    checks.push(`bridgeSchemaDir=${product.bridgeSchemaDir}`);
    checks.push(`webEntry=${product.webEntry}`);

    const { schemas, issues } = await loadBridgeSchemas(
      cwd,
      product.bridgeSchemaDir,
    );
    for (const issue of issues) {
      errors.push(`${issue.file}: ${issue.message}`);
    }
    checks.push(`bridge schemas=${schemas.length}`);
    if (schemas.length === 0) {
      warnings.push(
        `no bridge schemas under ${product.bridgeSchemaDir} (run hybrid init)`,
      );
    }
  } catch (err) {
    const message =
      err instanceof ConfigError || err instanceof Error ? err.message : String(err);
    errors.push(message);
  }

  return { ok: errors.length === 0, checks, errors, warnings };
}
