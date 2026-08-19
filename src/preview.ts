import http from "node:http";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { loadBridgeSchemas } from "./bridge-schemas.js";
import { loadProject } from "./config.js";
import { runValidate } from "./validate.js";
import { PREVIEW_DIR } from "./types.js";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderPreviewHtml(
  webEntry: string,
  methods: string[],
  events: string[],
): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>hybrid preview</title>
  <style>
    :root { color-scheme: light; font-family: ui-sans-serif, system-ui, sans-serif; }
    body { margin: 0; display: grid; grid-template-columns: 1fr 320px; min-height: 100vh; }
    main, aside { padding: 1.25rem; }
    main { background: #f4f6f8; }
    aside { background: #1d2733; color: #e8eef5; }
    h1, h2 { font-size: 1rem; margin: 0 0 0.75rem; }
    .log { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; white-space: pre-wrap; }
    button { margin: 0.25rem 0.25rem 0.25rem 0; }
    .muted { opacity: 0.75; font-size: 0.9rem; }
  </style>
</head>
<body>
  <main>
    <h1>Web surface</h1>
    <p class="muted">webEntry: <code>${escapeHtml(webEntry)}</code></p>
    <p>Use the fake native shell to mock bridge.call / bridge events via postMessage.</p>
    <div id="web-log" class="log"></div>
  </main>
  <aside>
    <h2>Fake native shell</h2>
    <p class="muted">postMessage mock — not a real WebView.</p>
    <div>
      ${methods.map((m) => `<button data-method="${escapeHtml(m)}">call ${escapeHtml(m)}</button>`).join("\n") || "<p>No methods</p>"}
    </div>
    <div style="margin-top:1rem">
      ${events.map((e) => `<button data-event="${escapeHtml(e)}">emit ${escapeHtml(e)}</button>`).join("\n") || "<p>No events</p>"}
    </div>
    <h2 style="margin-top:1.5rem">Shell log</h2>
    <div id="shell-log" class="log"></div>
  </aside>
  <script>
    const webLog = document.getElementById("web-log");
    const shellLog = document.getElementById("shell-log");
    function append(el, line) {
      el.textContent += line + "\\n";
    }
    window.addEventListener("message", (event) => {
      const data = event.data || {};
      if (data.type === "hybrid-bridge-call") {
        append(shellLog, "← call " + data.name + " " + JSON.stringify(data.params ?? {}));
        event.source?.postMessage({
          type: "hybrid-bridge-result",
          name: data.name,
          result: { ok: true, mocked: true },
        }, "*");
      }
      if (data.type === "hybrid-bridge-event") {
        append(webLog, "← event " + data.name + " " + JSON.stringify(data.payload ?? {}));
      }
      if (data.type === "hybrid-bridge-result") {
        append(webLog, "← result " + data.name + " " + JSON.stringify(data.result ?? {}));
      }
    });
    document.querySelectorAll("[data-method]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const name = btn.getAttribute("data-method");
        window.postMessage({ type: "hybrid-bridge-call", name, params: {} }, "*");
        append(webLog, "→ call " + name);
      });
    });
    document.querySelectorAll("[data-event]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const name = btn.getAttribute("data-event");
        window.postMessage({
          type: "hybrid-bridge-event",
          name,
          payload: { timestamp: new Date().toISOString() },
        }, "*");
        append(shellLog, "→ emit " + name);
      });
    });
  </script>
</body>
</html>
`;
}

export async function runPreview(
  cwd: string,
  options: { port?: number; writeOnly?: boolean } = {},
): Promise<{ url?: string; htmlPath: string }> {
  const validation = await runValidate(cwd);
  if (!validation.ok) {
    throw new Error(
      `validate failed:\n${validation.errors.map((e) => `  - ${e}`).join("\n")}`,
    );
  }

  const project = await loadProject(cwd);
  if (!project.product) {
    throw new Error("products.hybrid missing or invalid");
  }

  const { schemas } = await loadBridgeSchemas(
    cwd,
    project.product.bridgeSchemaDir,
  );
  const methods = schemas
    .filter((s) => s.schema.kind === "method")
    .map((s) => s.schema.name);
  const events = schemas
    .filter((s) => s.schema.kind === "event")
    .map((s) => s.schema.name);

  const outDir = path.join(cwd, PREVIEW_DIR);
  await mkdir(outDir, { recursive: true });
  const htmlPath = path.join(outDir, "index.html");
  const html = renderPreviewHtml(project.product.webEntry, methods, events);
  await writeFile(htmlPath, html, "utf8");
  console.log(`[hybrid] wrote ${path.relative(cwd, htmlPath)}`);

  if (options.writeOnly) {
    return { htmlPath };
  }

  const port = options.port ?? 4174;
  const server = http.createServer((_req, res) => {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(html);
  });

  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, "127.0.0.1", () => resolve());
  });

  const url = `http://127.0.0.1:${port}/`;
  console.log(`[hybrid] preview serving ${url}`);
  console.log("[hybrid] press Ctrl+C to stop");

  await new Promise<void>((resolve) => {
    const stop = () => {
      server.close(() => resolve());
    };
    process.once("SIGINT", stop);
    process.once("SIGTERM", stop);
  });

  return { url, htmlPath };
}
