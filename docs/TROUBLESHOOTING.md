# Troubleshooting

Common issues and fixes.

---

## “Tracelet UI not found. Build the UI or set uiPath.”

- **Installed from `.tgz`:** Ensure you ran a **full build** before packing (so `packages/sdk-express/dist/ui/` exists). Run `yarn build` or `yarn pack:sdks` from the repo root. The express build copies the UI from `sdk-ui/dist` into `sdk-express/dist/ui`; if the UI wasn’t built first, that folder will be missing and the packed package won’t contain the docs UI.
- **Monorepo:** Build the UI: `yarn workspace @tracelet/ui run build`. If you’re serving from Express without setting `uiPath`, the middleware looks for the bundled `dist/ui` (after express build), then `@tracelet/ui` in node_modules, then monorepo paths. So either run the full root `build` (which builds ui then express and runs the copy), or set `uiPath` to `packages/sdk-ui/dist` and build the UI.

---

## “Could not fetch routes” / connection error in the UI

- Ensure your API is running and reachable at the URL you set in `TRACELET_DOC_API_ROUTE` (when using the Vite dev server).
- Ensure the docs endpoint is mounted: `GET /tracelet-docs?json=true` must return JSON (array of route meta).
- If the UI is served by Express on the same origin, it will use that origin for `?json=true`; no `TRACELET_DOC_API_ROUTE` needed.

---

## UI 404 or blank at `/tracelet-docs`

- If using the built UI served by Express (Option B): check that the UI was built and that `uiPath` (if set) points to a directory that contains `index.html` (e.g. `packages/sdk-ui/dist` in the monorepo).
- If using the packed SDK: ensure you packed after a full build so `dist/ui` exists inside the express package.

---

## Workspace build fails or UI copy fails

- Build order must be: **@tracelet/core** → **@tracelet/ui** → **@tracelet/express**. The express build copies from `packages/sdk-ui/dist` into `packages/sdk-express/dist/ui`; if the UI hasn’t been built yet, the copy step has nothing to copy.
- From the repo root, `yarn build` (or `npm run build`) runs in the correct order.

---

## ENOENT: no such file or directory, node_modules/@tracelet/ui

- Empty or broken `node_modules/@tracelet` (e.g. after mixing npm/yarn or a failed install). Remove it and reinstall:
  ```bash
  rm -rf node_modules/@tracelet
  yarn install
  ```
- Or do a clean install: `rm -rf node_modules && yarn install`.
- Prefer a single package manager; if you use yarn, removing `package-lock.json` can avoid mixed lockfile issues.
