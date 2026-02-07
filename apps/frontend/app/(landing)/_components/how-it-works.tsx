import { CodeBlock } from "@/components/code-block"
import { sectionClassAlt, headingClass } from "./constants"

export function HowItWorks() {
  return (
    <section id="how-it-works" className={sectionClassAlt}>
      <h2 className={headingClass}>How Tracelet works</h2>

      <div className="mt-8 space-y-8">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            1. Plug it into Express
          </h3>
          <div className="mt-3">
            <CodeBlock
              code={`useTracelet(app, {
  serviceName: "payments",
  environment: "dev",
});`}
              language="typescript"
            />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-foreground">
            2. Tracelet observes routes & traffic
          </h3>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-muted-foreground">
            <li>HTTP method & full path</li>
            <li>Request body & headers</li>
            <li>Response status & shape</li>
            <li>Execution metadata</li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-foreground">
            3. Everything appears in one UI
          </h3>
          <p className="mt-2 text-muted-foreground">
            Logs · Docs · Test console. Available instantly at:
          </p>
          <code className="mt-2 inline-block rounded bg-muted px-2 py-1 text-sm font-mono">
            /tracelet-docs
          </code>
        </div>
      </div>
    </section>
  )
}
