# Installing packed SDKs

How to install Tracelet SDKs from `.tgz` tarballs in another project (without publishing to npm).

---

## 1. Build and pack

From the Tracelet repo root:

```bash
yarn pack:sdks
# or: npm run pack:sdks
```

This produces `.tgz` files (e.g. in each package directory or the root).

---

## 2. Install in your project

Copy the `.tgz` files into your project or note their path, then install.

**npm:**

```bash
cd /path/to/your-project

npm install /path/to/tracelet/packages/sdk-core/tracelet-core-0.0.1.tgz
npm install /path/to/tracelet/packages/sdk-express/tracelet-express-0.0.1.tgz
```

If the `.tgz` files are in your project directory:

```bash
npm install ./tracelet-core-0.0.1.tgz ./tracelet-express-0.0.1.tgz
```

**yarn:**

```bash
yarn add file:./tracelet-core-0.0.1.tgz file:./tracelet-express-0.0.1.tgz
```

**pnpm:**

```bash
pnpm add ./tracelet-core-0.0.1.tgz ./tracelet-express-0.0.1.tgz
```

`@tracelet/express` depends on `@tracelet/core`; installing the express tarball may pull in core. If not, install the core tarball first.

---

## 3. Use in code

```ts
import express from "express";
import { useTracelet, traceletDoc } from "@tracelet/express";

const app = express();

useTracelet(app, { serviceName: "my-app", environment: "dev" });

// Your routes and route meta (TraceletMeta[])...
const meta = [/* ... */];

traceletDoc(app, meta, { path: "/tracelet-docs" });

app.listen(3000);
```

The docs UI is **bundled** inside `@tracelet/express` when installed from the packed `.tgz`. You do **not** need to install `@tracelet/ui` or set `uiPath` unless you want to override the default.

---

## Optional: custom UI path

To serve a different build of the docs UI:

```ts
traceletDoc(app, meta, {
  path: "/tracelet-docs",
  uiPath: "/absolute/path/to/your/ui/dist",
});
```

See [RUNNING-LOCALLY.md](./RUNNING-LOCALLY.md) for more options.
