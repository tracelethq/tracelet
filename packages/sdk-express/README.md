# @tracelet/express

Express middleware and API docs UI for Tracelet.

## Overview

This package wires Tracelet into an Express app: request logging, optional file logging, and the Tracelet docs UI (API Explorer + Logs). It depends on `@tracelet/core` and `@tracelet/ui`.

## Install

```bash
npm install @tracelet/express
# or
yarn add @tracelet/express
```

**Peer dependency:** Express `^4` or `^5`.

## Usage

Call `tracelet()` with your Express `app` and options. Call it **before** your routes so the middleware runs for every request.

```ts
import express from "express";
import { tracelet } from "@tracelet/express";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

tracelet({
  app, // required
  environment: "local", // optional
  logFilePath: "./logs/tracelet.log", // optional
  debug: true, // optional
  traceletDocOptions: {
    uiBasePath: "/docs", // optional
    docFilePath: "./tracelet-doc.json", // optional
  },
});

// Your routes
app.use("/users", userRoutes);
app.listen(3000);
```

### Options

| Option | Default | Description |
|--------|---------|-------------|
| `app` | — | Express `Application` instance. Required. |
| `environment` | `undefined` | `"local"` or `null`. Not passing value means your code is deployed. |
| `logFilePath` | `"tracelet.log"` | Path to the log file. The Logger writes to this file and the docs UI GET `/logs` reads from it. |
| `debug` | `false` | Enable debug logging. |
| `traceletDocOptions.uiBasePath` | `"/tracelet-docs"` | Base path for the docs UI. Set e.g. `"/docs"` to serve at `/docs`. |
| `traceletDocOptions.docFilePath` | `"tracelet.doc.json"` | Path to a JSON file with route meta for the API Explorer. |
| `meta` | `null` | `TraceletMeta[]` for route meta instead of/in addition to a doc file. |

### What gets mounted

- **UI** – The built @tracelet/ui app is served at `uiBasePath` (default: `/tracelet-docs`, or e.g. `/docs` if you set `traceletDocOptions.uiBasePath`).
- **Routes meta** – `GET {uiBasePath}?json=true` returns route list for the Explorer.
- **Auth** – `POST {uiBasePath}/auth` and `GET {uiBasePath}/check-auth` when auth is configured.
- **Logs** – `GET {uiBasePath}/logs?limit=50&page=1&type=all&level=all&search=...` when `logFilePath` is set.

The middleware runs on every request to create the request-scoped logger and skips the docs UI path so asset requests are not logged.

## Class-based usage

You can also use the class and call `start()` yourself:

```ts
import { TraceletExpress } from "@tracelet/express";

const t = new TraceletExpress({
  app, // required
  logFilePath: "./logs/app.log", // optional
  traceletDocOptions: { uiBasePath: "/docs" }, // optional
  environment: "local", // optional
  debug: false, // optional
});
t.start();
```

## Exports

- **`tracelet`** – Function: `tracelet(options)` registers middleware and doc routes on `options.app`. Same as `traceletExpress`.
- **`TraceletExpress`** – Class: constructor + `start()` for the same behavior.
- **`traceletDoc`**, **`createLogsRouter`** – Used internally; can be used for custom mounting.

## License

MIT
