# Architecture

`hybrid` pairs a web runtime with a native shell through an explicit bridge contract.

## Composition (locked)

`products.hybrid`:

- `preset` (default `webview-react-vite`)
- `bridgeSchemaDir` (default `hybrid/bridge`)
- `webEntry`

Bridge schemas: `method.*.json` / `event.*.json` with `schemaVersion`, `kind`, `name`.

## CLI

| Command | v1 |
| --- | --- |
| `init` | family files + sample bridge schemas |
| `validate` | kernel + product + schema scan |
| `generate-bridge` | Web TS helpers only |
| `preview` | web + fake shell postMessage mock |
| `doctor` | kernel + product checks |
