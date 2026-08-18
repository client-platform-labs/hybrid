# hybrid

Client platform hybrid application engineering toolkit and CLI.

## Vision

`hybrid` is intended to provide a reusable engineering foundation for hybrid applications that combine web technologies with native shells. The focus is reducing integration cost while keeping runtime boundaries explicit and maintainable.

## Scope

This repository is intended to cover:

- hybrid app bootstrap and project structure
- bridge contract governance between web and native layers
- local development, debugging, and packaging workflows
- CLI commands, presets, and templates for common hybrid setups
- validation of runtime capabilities and environment assumptions

This repository should not absorb native business code or product-specific bridge logic.

## Local development

Requires Node.js 24.x LTS. This package depends on a local `../kernel` checkout via `file:` during scaffolding.

```bash
# from sibling kernel repo first:
#   cd ../kernel && npm install && npm run build
npm install
npm run build
node ./bin/hybrid.js --help
```

CLI surface: `init`, `generate-bridge`, `validate`, `preview`, `doctor`. Default preset: `webview-react-vite`.

`init` writes minimal family config:

- `client-platform.config.jsonc` with `products.hybrid`
- `client-platform.manifest.jsonc` with webview target stubs

`generate-bridge` and `preview` are stubs in this command-shell milestone.

## Documents

- [Roadmap](./ROADMAP.md)
- [Architecture](./docs/architecture.md)

## Working Principles

- bridge contracts are first-class artifacts
- web/native boundaries must be explicit
- developer experience should stay simple even when runtime topology is not
- target-specific implementation belongs in adapters and templates
