# Architecture

`hybrid` is the engineering toolkit for apps that pair a web runtime with a native shell. The bridge contract is the product, not a side effect.

## Family constraints already decided

- Runtime: Node.js 24.x LTS + TypeScript.
- CLI framework: `commander`.
- Packaging: ESM-first npm packages under `@client-platform/*`, with Product `bin` entries plus family command `client-platform`.
- Plugin metadata: `package.json#clientPlatform`.
- Command loading: static core commands; heavy/optional paths via `import()`.
- Config: human-authored JSONC, validated with JSON Schema 2020-12 via Ajv.
- Documents carry `schemaVersion` and migrate before validation.

Family files:

- Workspace config: `client-platform.config.jsonc`
- Project manifest: `client-platform.manifest.jsonc`

## Product shape

```text
CLI  ->  bridge schema  ->  generated bindings  ->  shell adapters  ->  preview/packaging
```

- **CLI**: init, generate, validate, preview, doctor.
- **Bridge schema**: methods, events, permissions, and compatibility ranges.
- **Generated bindings**: typed web and native helpers from the same contract.
- **Shell adapters**: iOS/Android/WebView/desktop differences.
- **Templates**: starter hybrid apps.

## Proposed package split

- `@client-platform/hybrid` CLI package, bin `hybrid`
- `@client-platform/hybrid-bridge`
- `@client-platform/hybrid-runtime-web`
- `@client-platform/adapter-*`
- `examples/*`

This Product is also loadable by the Umbrella CLI `client-platform` through `package.json#clientPlatform`.

## Inputs and outputs

| Flow | Input | Output |
| --- | --- | --- |
| `init` | target shell + web stack | project skeleton + bridge stub |
| `generate-bridge` | bridge schema | typed bindings on both sides |
| `validate` | schema + implementations | compatibility and capability report |
| `preview` | web app + shell adapter | local hybrid loop |

## What this repo should own

- Bridge domain model and codegen.
- Shell adapters and hybrid templates.
- Capability/environment validation.
- Local preview against a shell or shell mock.

## What lives in the family kernel

Kernel is a separate repository, [`client-platform-labs/kernel`](https://github.com/client-platform-labs/kernel). It publishes `@client-platform/kernel` and `@client-platform/cli`. This product depends on the library; it does not reimplement it.

Kernel owns:

- CLI bootstrap and diagnostics.
- Config/manifest load, migrate, validate.
- Plugin registry and lazy loading.
- Workspace/project discovery.
