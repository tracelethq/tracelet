"use client"

import { CodeBlock } from "@/components/code-block"
import { DocSection } from "./doc-section"
import type { SdkChoice } from "./sdk-context"

function InstallBlock({ sdk }: { sdk: SdkChoice }) {
  if (sdk === "core") {
    return (
      <>
        <p className="mb-4">
          Install only <code className="rounded bg-muted px-1">@tracelet/core</code> from a{" "}
          <code className="rounded bg-muted px-1">.tgz</code> tarball (or from npm when published).
        </p>
        <h3 className="font-semibold text-foreground mb-2">From .tgz</h3>
        <CodeBlock
          tabs={{
            npm: "npm install ./tracelet-core-0.0.1.tgz",
            yarn: "yarn add file:./tracelet-core-0.0.1.tgz",
            pnpm: "pnpm add ./tracelet-core-0.0.1.tgz",
          }}
          language="bash"
          className="mb-4"
        />
      </>
    )
  }
  return (
    <>
      <p className="mb-4">
        Install <code className="rounded bg-muted px-1">@tracelet/express</code> from a{" "}
        <code className="rounded bg-muted px-1">.tgz</code> tarball (or from npm when published).
        It depends on <code className="rounded bg-muted px-1">@tracelet/core</code> (installed automatically).
      </p>
      <h3 className="font-semibold text-foreground mb-2">From .tgz</h3>
      <CodeBlock
        tabs={{
          npm: "npm install ./tracelet-core-0.0.1.tgz ./tracelet-express-0.0.1.tgz",
          yarn: "yarn add file:./tracelet-core-0.0.1.tgz file:./tracelet-express-0.0.1.tgz",
          pnpm: "pnpm add ./tracelet-core-0.0.1.tgz ./tracelet-express-0.0.1.tgz",
        }}
        language="bash"
        className="mb-4"
      />
      <p className="text-muted-foreground">
        The docs UI is bundled inside <code className="rounded bg-muted px-1">@tracelet/express</code>.
        You do not need to install <code className="rounded bg-muted px-1">@tracelet/ui</code> or set{" "}
        <code className="rounded bg-muted px-1">uiPath</code> unless you want to override the default.
      </p>
    </>
  )
}

function UseInCodeBlock({ sdk }: { sdk: SdkChoice }) {
  if (sdk === "core") {
    return (
      <>
        <p className="mb-4">
          Use <code className="rounded bg-muted px-1">@tracelet/core</code> for logging and metadata in your app.
          You integrate it with your own framework or server (no Express required).
        </p>
        <CodeBlock
          code={`import { createTraceEvent } from "@tracelet/core";

// Use the core SDK for events, logging, and metadata.
// See @tracelet/core docs for API details.`}
          language="typescript"
        />
        <p className="mt-4 text-muted-foreground">
          For Express apps with the built-in docs UI, switch to <strong className="text-foreground">Express</strong> in the left sidebar.
        </p>
      </>
    )
  }
  if (sdk === "express") {
  return (
    <>
      <p className="mb-4">
        Plug Tracelet into your Express app and mount the docs UI so your
        team can see routes, logs, and test endpoints.
      </p>
      <CodeBlock
        code={`import express from "express";
import { useTracelet, traceletDoc } from "@tracelet/express";

const app = express();

useTracelet(app, { serviceName: "my-app", environment: "dev" });

// Your routes and route meta (TraceletMeta[])...
const meta = [/* ... */];

traceletDoc(app, meta);

app.listen(3000);`}
        language="typescript"
      />
      <p className="mt-4 text-muted-foreground">
        <code className="rounded bg-muted px-1">useTracelet</code> enables request/response logging and
        metadata. <code className="rounded bg-muted px-1">traceletDoc</code> serves the docs UI and{" "}
        <code className="rounded bg-muted px-1">GET /tracelet-docs?json=true</code> for route meta.
        Open <code className="rounded bg-muted px-1">/tracelet-docs</code> in the browser to use the UI.
      </p>
      <h3 className="font-semibold text-foreground mt-6 mb-2">Custom UI path</h3>
      <p className="text-muted-foreground">
        To serve a different build of the docs UI, pass{" "}
        <code className="rounded bg-muted px-1">uiPath</code>:
      </p>
      <CodeBlock
        code={`traceletDoc(app, meta, {
  path: "/tracelet-docs",
  uiPath: "/absolute/path/to/your/ui/dist",
});`}
        language="typescript"
        className="mt-2"
      />
    </>
  )
  }
  return (
    <>
      <p className="mb-4">
        Use <code className="rounded bg-muted px-1">@tracelet/core</code> for logging and metadata in your app.
        You integrate it with your own framework or server (no Express required).
      </p>
    </>
  )
}

function RunningLocallyBlock({ sdk }: { sdk: SdkChoice }) {
  if (sdk === "core") {
    return (
      <p className="text-muted-foreground">
        Run your app as usual. The core SDK does not serve a UI; it only provides
        logging and metadata. For the docs UI, use the <strong className="text-foreground">Express</strong> setup.
      </p>
    )
  }
  return (
    <>
      <p className="mb-4">
        Run your app as usual. The docs UI is served by Express at{" "}
        <code className="rounded bg-muted px-1">/tracelet-docs</code> (or your chosen path). No
        separate dev server unless you are customizing the UI.
      </p>
      <h3 className="font-semibold text-foreground mb-2">Single server (recommended)</h3>
      <p className="mb-2 text-muted-foreground">
        Start your app. Open <code className="rounded bg-muted px-1">http://localhost:3000/tracelet-docs</code>.
        The UI fetches route meta from the same origin; no env vars needed.
      </p>
      <h3 className="font-semibold text-foreground mt-4 mb-2">UI on a different origin</h3>
      <p className="text-muted-foreground">
        If the docs UI is served from another port (e.g. a separate Vite
        app), set <code className="rounded bg-muted px-1">VITE_API_ROUTE</code> to your API base URL
        (e.g. <code className="rounded bg-muted px-1">http://localhost:3000</code>) so the UI can
        call <code className="rounded bg-muted px-1">/tracelet-docs?json=true</code>.
      </p>
    </>
  )
}

type UsingDocsContentProps = { sdk: SdkChoice }

export function UsingDocsContent({ sdk }: UsingDocsContentProps) {
  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          For developers
        </h1>
        <p className="mt-2 text-muted-foreground">
          How to use Tracelet in your app: install, integrate, run locally, and fix common issues.
          Switch SDK via the left sidebar.
        </p>
      </div>

      <DocSection id="install" title="Install">
        <InstallBlock sdk={sdk} />
      </DocSection>

      <DocSection id="use-in-code" title="Use in code">
        <UseInCodeBlock sdk={sdk} />
      </DocSection>

      <DocSection id="running-locally" title="Running locally">
        <RunningLocallyBlock sdk={sdk} />
      </DocSection>

      <DocSection id="troubleshooting" title="Troubleshooting">
        <h3 className="font-semibold text-foreground mb-2">
          &quot;Tracelet UI not found. Build the UI or set uiPath.&quot;
        </h3>
        <p className="mb-4 text-muted-foreground">
          Only applies to <strong className="text-foreground">Express</strong>. If you installed from a .tgz, the pack may have been created
          before the UI was built. Re-pack after a full build, or set{" "}
          <code className="rounded bg-muted px-1">uiPath</code> to a directory that contains{" "}
          <code className="rounded bg-muted px-1">index.html</code>.
        </p>
        <h3 className="font-semibold text-foreground mb-2">
          &quot;Could not fetch routes&quot; / connection error
        </h3>
        <p className="mb-4 text-muted-foreground">
          Ensure your API is running and{" "}
          <code className="rounded bg-muted px-1">GET /tracelet-docs?json=true</code> returns
          JSON (array of route meta). If the UI is on another origin, set{" "}
          <code className="rounded bg-muted px-1">VITE_API_ROUTE</code>.
        </p>
        <h3 className="font-semibold text-foreground mb-2">
          UI 404 or blank at /tracelet-docs
        </h3>
        <p className="text-muted-foreground">
          Check that <code className="rounded bg-muted px-1">traceletDoc</code> is mounted and that
          the bundled UI or <code className="rounded bg-muted px-1">uiPath</code> contains{" "}
          <code className="rounded bg-muted px-1">index.html</code>.
        </p>
      </DocSection>
    </div>
  )
}
