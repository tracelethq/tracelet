# Build

How to build the Tracelet packages and create installable SDK tarballs.

---

## Build order

From the repo root:

```bash
npm run build
# or: yarn build
# or: pnpm run build
```

This runs in order:

1. **@tracelet/core** – core SDK
2. **@tracelet/ui** – docs UI (Vite build → `packages/sdk-ui/dist/`)
3. **@tracelet/express** – Express middleware and `traceletDoc`; copies the built UI into `packages/sdk-express/dist/ui/` so the packed package can serve the docs without a separate `@tracelet/ui` install.

After a successful build:

- `packages/sdk-core/dist/` – compiled core SDK
- `packages/sdk-ui/dist/` – built docs UI (static files)
- `packages/sdk-express/dist/` – compiled Express SDK and **dist/ui/** (bundled docs UI)

---

## Build a single package

```bash
npm run build --workspace=@tracelet/core
npm run build --workspace=@tracelet/ui
npm run build --workspace=@tracelet/express
# or with yarn:
yarn workspace @tracelet/core run build
yarn workspace @tracelet/ui run build
yarn workspace @tracelet/express run build
```

**Note:** Building only `@tracelet/express` requires `packages/sdk-ui/dist/` to exist first (so the copy step can run). Run the UI build first, or run the full root `build` script.

---

## Pack SDKs (create .tgz files)

To build everything and create installable `.tgz` files:

```bash
npm run pack:sdks
# or: yarn pack:sdks
# or: pnpm run pack:sdks
```

This will:

1. **Build** `@tracelet/core`, `@tracelet/ui`, and `@tracelet/express` (in that order).
2. **Pack** each workspace into `.tgz` tarballs.

The `.tgz` files are created in each package directory (or the root, depending on npm version). Typical names:

- `tracelet-core-0.0.1.tgz`
- `tracelet-express-0.0.1.tgz` (includes bundled docs UI in `dist/ui/`)
- `tracelet-ui-0.0.1.tgz`

---

## Next steps

- [Installing packed SDKs](./INSTALLING-PACKED-SDKS.md) – use the `.tgz` files in another project
- [External testing](./EXTERNAL-TESTING.md) – test with `yarn link` or `npm pack` outside the monorepo
