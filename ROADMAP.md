# Roadmap

This is the first delivery map for `hybrid`. Shared-kernel ownership is still an open family decision.

## Now

- Keep the repository charter current.
- Lock the domain language: shell, web runtime, bridge, capability, schema.
- Define the bridge contract format and versioning rules.
- Define the first CLI surface: `init`, `generate-bridge`, `validate`, `preview`, `doctor`.

## Next

- Ship a local MVP that generates typed bridge helpers from a contract and validates both sides against it.
- Keep native-shell differences in adapters and templates.
- Add one runnable example with a fake native shell so the web side can be developed without a device.

## Later

- Add real shell adapters and packaging flows.
- Add capability discovery and environment assumption checks.
- Align package layout with the family shared kernel once that boundary is decided.

## Non-goals for v1

- Absorbing native business apps into this repo.
- Inventing a new WebView engine.
- Treating RN delivery as a subset of hybrid; RN stays a sibling product.
