import { createCli } from "@client-platform/kernel";
import { runDoctor } from "./doctor.js";
import { runInit } from "./init.js";
import { DEFAULT_PRESET } from "./types.js";
import { runValidate } from "./validate.js";

function fail(err: unknown): never {
  const message = err instanceof Error ? err.message : String(err);
  console.error(message);
  process.exit(1);
}

export async function run(argv: string[]): Promise<void> {
  const program = createCli({
    name: "hybrid",
    version: "0.0.0",
    description: "Client platform hybrid toolkit",
  });

  program
    .command("init")
    .description("Initialize hybrid with default preset webview-react-vite")
    .option("--preset <name>", "preset name", DEFAULT_PRESET)
    .action(async (opts: { preset: string }) => {
      try {
        const written = await runInit(process.cwd(), opts.preset);
        for (const file of written) {
          console.log(`wrote ${file}`);
        }
        console.log(`init complete (preset=${opts.preset})`);
      } catch (err) {
        fail(err);
      }
    });

  program
    .command("generate-bridge")
    .description("Generate typed bridge bindings from schema (stub)")
    .action(async () => {
      console.log(
        "[hybrid] generate-bridge: stub — bridge schema codegen lands in a later milestone.",
      );
    });

  program
    .command("validate")
    .description("Validate hybrid config and bridge contracts")
    .action(async () => {
      try {
        const result = await runValidate(process.cwd());
        for (const check of result.checks) {
          console.log(`ok: ${check}`);
        }
        for (const error of result.errors) {
          console.error(`error: ${error}`);
        }
        if (!result.ok) {
          process.exit(1);
        }
        console.log("validate complete");
      } catch (err) {
        fail(err);
      }
    });

  program
    .command("preview")
    .description("Run local hybrid preview with fake shell (stub)")
    .action(async () => {
      console.log(
        "[hybrid] preview: stub — fake native shell preview lands in a later milestone.",
      );
    });

  program
    .command("doctor")
    .description("Product diagnostics")
    .action(async () => {
      const findings = await runDoctor(process.cwd());
      let failed = false;
      for (const finding of findings) {
        console.log(`[${finding.severity}] ${finding.code}: ${finding.message}`);
        if (finding.severity === "error") {
          failed = true;
        }
      }
      if (failed) {
        process.exit(1);
      }
    });

  await program.parseAsync(argv);
}
