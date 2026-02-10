# Running locally

How to run your Express app and the Tracelet docs UI on your machine.

You need **two things** for the docs to work: an Express app that uses Tracelet and serves the docs, and the UI (either from a dev server or from the built assets).

---

## Option A: UI dev server (recommended for development)

Best when you’re changing the docs UI and want hot reload.

### 1. Start your Express API

Your app must use the Tracelet Express middleware and mount the docs so that:

- `GET /tracelet-docs` (or your chosen path) can serve the UI or a placeholder.
- `GET /tracelet-docs?json=true` returns the route meta JSON.

Example from the monorepo:

```bash
cd examples/express-basic
npm run dev
# or: npx ts-node index.ts
```

Use `traceletDoc(app, meta, options)` from `@tracelet/express` and ensure the `?json=true` route is mounted.

### 2. Start the UI in dev mode

Point the UI at your API base URL:

```bash
cd packages/sdk-ui
TRACELET_DOC_API_ROUTE=http://localhost:3000 npm run dev
# or: yarn dev / pnpm run dev
```

Replace `http://localhost:3000` with your API’s origin if different.

### 3. Open the docs

Use the URL Vite prints (e.g. `http://localhost:5173/tracelet-docs/`). The UI will load route metadata from `TRACELET_DOC_API_ROUTE/tracelet-docs?json=true`.

---

## Option B: UI served by Express (single server)

Use this when you want one server and no separate Vite process. Works when:

- Using the monorepo (built UI in `packages/sdk-ui/dist`), or
- Using the packed `@tracelet/express` (UI is bundled in `dist/ui`).

### 1. Build the UI (monorepo only)

If you’re in the monorepo and not using the packed package:

```bash
yarn workspace @tracelet/ui run build
```

### 2. Mount the docs in your Express app

**When using the packed SDK** (installed from `.tgz`): you don’t need to set `uiPath`; the bundled UI is used automatically.

```ts
import { traceletDoc } from "@tracelet/express";

traceletDoc(app, meta, { path: "/tracelet-docs" });
```

**When developing in the monorepo** and want to serve the built UI from `sdk-ui/dist`:

```ts
traceletDoc(app, meta, {
  path: "/tracelet-docs",
  uiPath: "/absolute/path/to/tracelet/packages/sdk-ui/dist",
});
```

### 3. Start the app

Start the app and open `http://localhost:<port>/tracelet-docs`. The UI will call the same origin for `/tracelet-docs?json=true`, so `TRACELET_DOC_API_ROUTE` is not needed.

---

## Environment variables (UI)

| Variable         | Purpose |
|------------------|--------|
| `TRACELET_DOC_API_ROUTE` | Base URL of your API (e.g. `http://localhost:3000`). Used to fetch `/tracelet-docs?json=true`. Only needed when the UI runs on a **different origin** (e.g. Vite dev server in Option A). |

---

## Next steps

- [Troubleshooting](./TROUBLESHOOTING.md) – common issues
- [Project layout](./PROJECT-LAYOUT.md) – repo structure
