# @tracelet/ui

React UI for Tracelet API docs and request logs.

## Overview

This package is the frontend for the Tracelet docs UI: **API Explorer** (browse routes, try requests, see params/body/headers and responses) and **Logs** (view request and app logs, filter and paginate, grouped by trace ID). It is built with Vite and intended to be served by `@tracelet/express` at a configurable base path.

## Features

- **API Explorer** – Sidebar with route tree, API details panel (Params, Body, Headers, Authorization), Try-it (send request, view response/headers), and route command palette.
- **Logs** – Filter by type (HTTP/App) and level, search, pagination (e.g. last 50 logs per page). Log entries grouped by request/trace ID with collapsible, terminal-style display and JSON highlighting.
- **Persistence** – Zustand stores with optional persistence for active view (API Explorer vs Logs), sidebar open state, and per-route tab (Params/Body/Headers, Response/Headers). URL sync for shareable links.
- **Auth** – Optional login form and token for protected docs and APIs.
- **Theme** – System/light/dark theme support.

## Install

Typically you use this package indirectly via `@tracelet/express`, which serves the built UI. To depend on it in another app (e.g. custom host):

```bash
npm install @tracelet/ui
# or
yarn add @tracelet/ui
```

**Peer dependencies:** React 18+ (tested with 19), and the host must serve the built assets and pass config (e.g. `TRACELET_UI_CONSTANTS`) as needed.

## Build

```bash
cd packages/sdk-ui
pnpm install
pnpm run build
```

Output is in `dist/`. The Express SDK serves this and rewrites the HTML so script and asset paths use the configured base path.

## Development

```bash
pnpm run dev
```

Runs the Vite dev server (default port 3004). You can point your app’s docs iframe or redirect to this URL during development.

## Project structure

- **`src/pages`** – `DocsLayout`, `RoutesPage`, `LogsPage`.
- **`src/components/logs`** – Logs view (filters, list, grouped entries, JSON highlight).
- **`src/components/api-explorer`** – Routes sidebar, route command palette, API details panel, empty state; `api-details/` for tabs, params table, response panel, etc.
- **`src/components/app-sidebar`** – App-level sidebar (API Explorer vs Logs).
- **`src/hooks`** – Persistence (Zustand + URL), mobile detection.
- **`src/components/ui`** – Shared UI primitives (sidebar, button, dialog, tabs, etc.).

## Configuration

The UI reads config injected by the server (e.g. from `@tracelet/express`), such as:

- Base path for API and docs routes.
- Auth required / check-auth URL.
- Routes and logs API URLs.

See the Express package and the UI’s `constants` / env usage for details.

## License

MIT
