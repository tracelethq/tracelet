# @tracelet/core

Framework-agnostic core logic for Tracelet SDKs.

## Overview

This package provides the core used by Tracelet SDKs (e.g. `@tracelet/express`): **TraceletCore** wires together a **Logger** and **RouteMeta** from a single options object. It also exports lower-level utilities (sanitization, auth, LogReader) for custom integrations. It contains **no framework-specific code**.

## Install

```bash
npm install @tracelet/core
# or
yarn add @tracelet/core
```

## Usage

### TraceletCore (main entry for SDKs)

`TraceletCore` is the primary entry point. You pass options, call `start()`, and get back the logger and route meta to attach to your framework (e.g. Express middleware and docs routes).

```ts
import { TraceletCore } from "@tracelet/core";

const tracelet = new TraceletCore({
  environment: "local", // optional
  logFilePath: "./logs/app.log", // optional
  traceletDocOptions: {
    defaultDocFile: "./tracelet-doc.json", // optional
    meta: [], // optional
  },
  debug: false, // optional
});

const { logger, routeMeta } = tracelet.start();

// Use logger in request middleware (init per request, logHttp on response).
// Use routeMeta to serve route list for the API Explorer (e.g. routeMeta.getRoutes()).
```

#### TraceletCoreOptions


| Option                              | Default               | Description                                                                              |
| ----------------------------------- | --------------------- | ---------------------------------------------------------------------------------------- |
| `environment`                       | `undefined`           | `"local"` or `null`. Not passing value means your code is deployed.                      |
| `logFilePath`                       | `"tracelet.log"`      | When set, logs are appended to this file (Node only). One human-readable line per entry. |
| `traceletDocOptions.defaultDocFile` | `"tracelet.doc.json"` | Path to a JSON file with route meta for the docs UI.                                     |
| `traceletDocOptions.meta`           | `null`                | `TraceletMeta[]` for route meta (used with or without a doc file).                       |
| `debug`                             | `false`               | When `true`, enables debug logging.                                                      |


#### start()

Returns `{ logger, routeMeta }`:

- **logger** – `Logger` instance. Call `logger.init({ method, route })` at request start and `logger.logHttp(...)` on response. Use `logger.debug` / `info` / `warn` / `error` for app logs (they carry request context when used after `init`).
- **routeMeta** – `RouteMeta` instance. Loads meta from `defaultDocFile` and/or `meta`; use it to serve the route list (e.g. for the API Explorer).

---

### Using the Logger directly

If you integrate without `TraceletCore`, you can create a `Logger` yourself:

```ts
import { Logger } from "@tracelet/core";

const logger = new Logger({
  logFilePath: "./logs/app.log", // optional
  environment: "local", // optional
});

const requestId = logger.init({ method: "GET", route: "/ping" });
logger.info("Processing request");
logger.logHttp({
  method: "GET",
  route: "/ping",
  statusCode: 200,
  durationMs: 10,
  responseSize: 128,
});
```

---

### LogReader

For reading log files (e.g. in a logs API), use `LogReader`:

```ts
import { LogReader } from "@tracelet/core";

const reader = new LogReader();
const lines = reader.readLastLinesSync("/path/to/app.log", 100); // path required, maxLines optional
```

---

## Exports

- **Core:** `TraceletCore` – Main entry; options and `start()` return `{ logger, routeMeta }`.
- **Logger:** `Logger`, `LogReader`; types: `HttpLogInput`, `LoggerOptions`, `LogPayload`.
- **Meta:** `RouteMeta`, `DEFAULT_DOC_FILE`, `resolveDefaultUiPath`, and meta types (`TraceletMeta`, etc.).
- **Schema / utils:** `sanitize`, `inferShape`, `getEnv`.
- **Auth:** `Auth`, `createAuth`, `AuthOptions`, `JwtPayload`.

## License

MIT