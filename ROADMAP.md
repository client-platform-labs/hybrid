# Roadmap

## Now

- CLI: `init`, `generate-bridge`, `validate`, `preview`, `doctor`
- Bridge schemas under `hybrid/bridge/method.*.json` / `event.*.json`
- `generate-bridge` writes Web TS types + `bridge.call` / `bridge.on`
- `preview` serves web + in-page fake native shell (`--write-only` available)

## Next

- Deeper schema validation (Ajv) for bridge files
- Wire generated helpers into a Vite web entry by default

## Later

- Native Swift/Kotlin bindings
- Real device / WebView shells

## Non-goals for v1

- Native codegen
- Real device preview
