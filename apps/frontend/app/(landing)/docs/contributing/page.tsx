import { CodeBlock } from "@/components/code-block"
import { DocPageToc } from "../_components/doc-page-toc"
import { DocSection } from "../_components/doc-section"

const sections = [
  { id: "setup", label: "Setup" },
  { id: "build", label: "Build" },
  { id: "project-layout", label: "Project layout" },
  { id: "pack-and-release", label: "Pack & release" },
  { id: "external-testing", label: "External testing" },
]

export default function ContributingDocsPage() {
  return (
    <>
      <article className="min-w-0 flex-1">
        <div className="space-y-12">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              For contributors
            </h1>
            <p className="mt-2 text-muted-foreground">
              How to set up the Tracelet monorepo, build packages, pack SDKs,
              and test changes outside the repo.
            </p>
          </div>

          <DocSection id="setup" title="Setup">
            <p className="mb-4">Set up the Tracelet monorepo on your machine.</p>
            <h3 className="font-semibold text-foreground mb-2">Prerequisites</h3>
            <ul className="list-disc pl-5 space-y-1 mb-4 text-muted-foreground">
              <li><strong className="text-foreground">Node.js</strong> 18+ (20+ recommended)</li>
              <li><strong className="text-foreground">npm</strong>, <strong className="text-foreground">yarn</strong>, or <strong className="text-foreground">pnpm</strong> (use one consistently)</li>
            </ul>
            <h3 className="font-semibold text-foreground mb-2">Clone and install</h3>
            <CodeBlock
              code={`git clone <repo-url>
cd tracelet`}
              language="bash"
              className="mb-4"
            />
            <p className="mb-2 text-muted-foreground">Install dependencies from the repository root:</p>
            <CodeBlock
              tabs={{
                npm: "npm install",
                yarn: "yarn install",
                pnpm: "pnpm install",
              }}
              language="bash"
            />
            <p className="mt-4 text-muted-foreground">
              This installs dependencies for all workspaces (packages/*, examples/*).
            </p>
          </DocSection>

          <DocSection id="build" title="Build">
            <p className="mb-4">Build the Tracelet packages. Order matters: core → ui → express.</p>
            <h3 className="font-semibold text-foreground mb-2">Full build (from repo root)</h3>
            <CodeBlock
              tabs={{
                npm: "npm run build",
                yarn: "yarn build",
                pnpm: "pnpm run build",
              }}
              language="bash"
              className="mb-4"
            />
            <p className="mb-2 text-muted-foreground">This runs in order:</p>
            <ol className="list-decimal pl-5 space-y-1 mb-4 text-muted-foreground">
              <li><strong className="text-foreground">@tracelet/core</strong> – core SDK</li>
              <li><strong className="text-foreground">@tracelet/ui</strong> – docs UI (Vite → packages/sdk-ui/dist/)</li>
              <li><strong className="text-foreground">@tracelet/express</strong> – middleware + traceletDoc; copies sdk-ui/dist into dist/ui/</li>
            </ol>
            <h3 className="font-semibold text-foreground mb-2">Build a single package</h3>
            <CodeBlock
              tabs={{
                npm: "npm run build",
                yarn: `yarn workspace @tracelet/core run build
yarn workspace @tracelet/ui run build
yarn workspace @tracelet/express run build`,
                pnpm: "pnpm run build",
              }}
              language="bash"
            />
            <p className="mt-4 text-muted-foreground">
              Building only <code className="rounded bg-muted px-1">@tracelet/express</code> requires{" "}
              <code className="rounded bg-muted px-1">packages/sdk-ui/dist/</code> to exist first (copy step).
            </p>
          </DocSection>

          <DocSection id="project-layout" title="Project layout">
            <CodeBlock
              code={`tracelet/
├── package.json              # Root workspace config and scripts
├── packages/
│   ├── sdk-core/             # @tracelet/core – core SDK
│   ├── sdk-express/          # @tracelet/express (middleware + traceletDoc)
│   │   ├── dist/
│   │   │   └── ui/           # Bundled docs UI (after build, for packed .tgz)
│   │   └── scripts/copy-ui.js
│   └── sdk-ui/               # @tracelet/ui – Vite + React docs UI
│       └── dist/
├── examples/
│   └── express-basic/
└── docs/`}
              language="plaintext"
            />
          </DocSection>

          <DocSection id="pack-and-release" title="Pack & release">
            <p className="mb-4">
              Create installable <code className="rounded bg-muted px-1">.tgz</code> files for the SDKs.
            </p>
            <CodeBlock
              tabs={{
                npm: "npm run pack:sdks",
                yarn: "yarn pack:sdks",
                pnpm: "pnpm run pack:sdks",
              }}
              language="bash"
              className="mb-4"
            />
            <p className="mb-2 text-muted-foreground">This will:</p>
            <ol className="list-decimal pl-5 space-y-1 text-muted-foreground">
              <li>Build @tracelet/core, @tracelet/ui, @tracelet/express (in that order)</li>
              <li>Pack each workspace into .tgz tarballs</li>
            </ol>
            <p className="mt-4 text-muted-foreground">
              Typical output: <code className="rounded bg-muted px-1">tracelet-core-0.0.1.tgz</code>,{" "}
              <code className="rounded bg-muted px-1">tracelet-express-0.0.1.tgz</code>,{" "}
              <code className="rounded bg-muted px-1">tracelet-ui-0.0.1.tgz</code> (in each package dir or root).
            </p>
          </DocSection>

          <DocSection id="external-testing" title="External testing">
            <p className="mb-4">
              Test that the SDK works outside the monorepo (e.g. before publishing).
            </p>
            <h3 className="font-semibold text-foreground mb-2">Option 1: yarn link</h3>
            <p className="mb-2 text-muted-foreground">
              From monorepo: build packages, then in <code className="rounded bg-muted px-1">packages/sdk-core</code> and{" "}
              <code className="rounded bg-muted px-1">packages/sdk-express</code> run <code className="rounded bg-muted px-1">yarn link</code>.
              In your external app run <code className="rounded bg-muted px-1">yarn link @tracelet/core</code> and{" "}
              <code className="rounded bg-muted px-1">yarn link @tracelet/express</code>.
            </p>
            <h3 className="font-semibold text-foreground mb-2">Option 2: Install from .tgz</h3>
            <p className="mb-2 text-muted-foreground">Run pack:sdks, then in your external app:</p>
            <CodeBlock
              tabs={{
                npm: "npm install ./path/to/tracelet-core-0.0.1.tgz ./path/to/tracelet-express-0.0.1.tgz",
                yarn: "yarn add file:./path/to/tracelet-express-0.0.1.tgz file:./path/to/tracelet-core-0.0.1.tgz",
                pnpm: "pnpm add ./path/to/tracelet-core-0.0.1.tgz ./path/to/tracelet-express-0.0.1.tgz",
              }}
              language="bash"
            />
            <p className="mt-4 text-muted-foreground">
              Verify imports, types, and that the docs UI loads. Use yarn link for daily dev; use .tgz before publishing.
            </p>
          </DocSection>
        </div>
      </article>
      <DocPageToc sections={sections} />
    </>
  )
}
