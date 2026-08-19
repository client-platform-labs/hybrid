# Roadmap

## Now

- CLI: `init`, `generate-bridge`, `validate`, `preview`, `doctor`
- Default preset: `webview-react-vite`
- Bridge schemas (locked): `hybrid/bridge/<kind>.<name>.json` (`method` / `event`)
- `products.hybrid` (locked): `preset`, `bridgeSchemaDir`, `webEntry`
- `generate-bridge` v1 (locked): Web TS types + `bridge.call` / `bridge.on`
- `preview` v1 (locked): web + in-page fake native shell (postMessage mock)

## Next

- Implement schema stubs on `init`, real `generate-bridge`, placeholder `preview`.

## Later

- Real shell adapters and native bindings.
- Packaging flows.

## Non-goals for v1

- Real device WebView packaging.
- Treating RN as a hybrid subset.
