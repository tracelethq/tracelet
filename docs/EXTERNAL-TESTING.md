# External testing

How to test Tracelet **outside the monorepo** so you know it works for real users, not just “on my machine”.

Use **Option 1** first for quick iteration; use **Option 2** before publishing.

---

## Option 1: `yarn link` (fastest)

Simulates npm install without publishing.

### 1. Build packages

From monorepo root:

```bash
yarn workspace @tracelet/core run build
yarn workspace @tracelet/ui run build
yarn workspace @tracelet/express run build
```

Ensure `dist/` exists in each package.

### 2. Link the packages globally

```bash
cd packages/sdk-core
yarn link

cd ../sdk-express
yarn link
```

### 3. Create a new project (outside monorepo)

```bash
cd ~/Projects
mkdir tracelet-test
cd tracelet-test
yarn init -y
yarn add express
```

### 4. Link Tracelet into the app

```bash
yarn link @tracelet/core
yarn link @tracelet/express
```

### 5. Test

Use the SDK in your app (e.g. `useTracelet`, `traceletDoc`), run the app, and confirm behavior and docs UI.

---

## Option 2: Install from `.tgz` (closest to real npm)

This tests exactly what users get when they install from a tarball.

### 1. Build and pack

From monorepo root:

```bash
yarn build
yarn pack:sdks
# or: npm run pack:sdks
```

You’ll get `.tgz` files (e.g. in each package directory or the root).

### 2. Install in an external app

```bash
cd ~/Projects/tracelet-test
yarn add file:./path/to/tracelet-express-0.0.1.tgz
# install core too if not pulled in
yarn add file:./path/to/tracelet-core-0.0.1.tgz
```

Or with npm:

```bash
npm install ./tracelet-core-0.0.1.tgz ./tracelet-express-0.0.1.tgz
```

### 3. Verify

- Imports work (`@tracelet/express`, `@tracelet/core`).
- No `src/` paths leak; only `dist/` is used.
- Types resolve.
- Runtime works and docs UI loads (bundled in express package).
- No monorepo-only path hacks are required.

If this works, you’re in good shape for publishing.

---

## What to verify

- Imports resolve
- No `src/` in published/copied files; only `dist/`
- Types resolve
- Runtime logs and behavior are correct
- Docs UI loads when using `traceletDoc`
- No monorepo-only paths or env required

---

## Recommendation

- Use **`yarn link`** for daily dev and quick checks.
- Use **`npm pack` / `pack:sdks`** and install from `.tgz` once before first publish.
- Don’t publish without testing the packed package in an external app.
