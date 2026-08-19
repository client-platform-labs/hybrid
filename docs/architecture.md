# Architecture

`hybrid` pairs a web runtime with a native shell through an explicit bridge contract.

## Composition (locked)

`products.hybrid` in Workspace Config:

- `preset` (default `webview-react-vite`)
- `bridgeSchemaDir` (default `hybrid/bridge`)
- `webEntry`

Bridge schemas: `hybrid/bridge/method.*.json` and `hybrid/bridge/event.*.json`.

## CLI

| Command | v1 |
| --- | --- |
| `init` | family files + bridge dir stubs |
| `validate` | kernel + product segment (+ later schema scan) |
| `generate-bridge` | Web TS helpers only |
| `preview` | web + fake shell mock |
| `doctor` | kernel + product checks |

## Non-goals for v1

- Swift/Kotlin codegen
- Real device shells
