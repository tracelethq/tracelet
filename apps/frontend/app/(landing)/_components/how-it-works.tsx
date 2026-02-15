"use client";

import { Plug, ScanSearch, LayoutPanelTop } from "lucide-react";
import { CodeBlock } from "@/components/code-block";
import Decorations from "@/components/ui/decorations";
import { cn } from "@/lib/utils";

import "@/styles/animations.css";

const steps = [
  {
    step: 1,
    title: "Plug it into Express",
    icon: Plug,
    content: (
      <CodeBlock
        code={`useTracelet(app, {
  serviceName: "payments",
  environment: "dev",
});`}
        language="typescript"
      />
    ),
  },
  {
    step: 2,
    title: "Tracelet observes routes & traffic",
    icon: ScanSearch,
    content: (
      <ul className="space-y-2 text-sm text-muted-foreground">
        <li>• HTTP method & full path</li>
        <li>• Request body & headers</li>
        <li>• Response status & shape</li>
        <li>• Execution metadata</li>
      </ul>
    ),
  },
  {
    step: 3,
    title: "Everything appears in one UI",
    icon: LayoutPanelTop,
    content: (
      <p className="text-sm text-muted-foreground">
        Logs · Docs. Available instantly at{" "}
        <code className="rounded bg-muted px-2 py-0.5 font-mono text-foreground">
          /tracelet-docs
        </code>
      </p>
    ),
  },
];

function FlowDiagram() {
  return (
    <div className="flex items-center justify-center gap-6 px-6 py-10 sm:gap-12 sm:px-12 sm:py-14">
      {/* Express */}
      <div
        className="flex flex-col items-center gap-3"
        style={{ animation: "node-enter 0.5s ease-out forwards" }}
      >
        <div className="flex h-20 w-20 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-border/60 bg-card shadow-md transition-all duration-300 hover:border-primary/30 hover:shadow-lg sm:h-24 sm:w-24 dark:border-white/10">
          <Plug className="size-7 text-primary sm:size-8" strokeWidth={2} />
          <span className="text-xs font-semibold text-primary sm:text-sm">
            Express
          </span>
        </div>
        <span className="text-xs uppercase tracking-wider text-muted-foreground">
          Plug in
        </span>
      </div>

      {/* Arrow 1 */}
      <div className="relative flex flex-1 max-w-[140px] items-center justify-center sm:max-w-[200px]">
        <div className="h-0.5 w-full overflow-hidden rounded-full bg-primary/20" />
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ animation: "flow-glow 2s ease-in-out infinite" }}
        >
          <div className="absolute inset-0 bg-linear-to-r from-transparent via-primary/50 to-transparent" />
        </div>
        <div className="absolute inset-0 flex items-center overflow-hidden">
          <div className="flex w-full">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="size-2 shrink-0 rounded-full bg-primary shadow-[0_0_8px_var(--primary)]"
                style={{
                  animation: "flow-dot 2.5s ease-in-out infinite",
                  animationDelay: `${i * 0.7}s`,
                }}
              />
            ))}
          </div>
        </div>
        <svg
          className="absolute right-0 size-5 text-primary drop-shadow-sm"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </div>

      {/* Tracelet */}
      <div
        className="flex flex-col items-center gap-3"
        style={{
          animation: "node-enter 0.5s ease-out 0.15s forwards",
          opacity: 0,
        }}
      >
        <div className="flex h-20 w-20 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-primary/50 bg-primary/10 shadow-lg shadow-primary/10 transition-all duration-300 hover:scale-105 hover:border-primary/70 hover:shadow-xl hover:shadow-primary/20 dark:border-primary/40 dark:bg-primary/15 sm:h-24 sm:w-24">
          <ScanSearch
            className="size-7 text-primary sm:size-8"
            strokeWidth={2}
          />
          <span className="text-xs font-bold text-primary sm:text-sm">
            Tracelet
          </span>
        </div>
        <span className="text-xs uppercase tracking-wider text-muted-foreground">
          Observes
        </span>
      </div>

      {/* Arrow 2 */}
      <div className="relative flex flex-1 max-w-[140px] items-center justify-center sm:max-w-[200px]">
        <div className="h-0.5 w-full overflow-hidden rounded-full bg-primary/20" />
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ animation: "flow-glow 2s ease-in-out 0.3s infinite" }}
        >
          <div className="absolute inset-0 bg-linear-to-r from-transparent via-primary/50 to-transparent" />
        </div>
        <div className="absolute inset-0 flex items-center overflow-hidden">
          <div className="flex w-full">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="size-2 shrink-0 rounded-full bg-primary shadow-[0_0_8px_var(--primary)]"
                style={{
                  animation: "flow-dot 2.5s ease-in-out infinite",
                  animationDelay: `${i * 0.7 + 0.4}s`,
                }}
              />
            ))}
          </div>
        </div>
        <svg
          className="absolute right-0 size-5 text-primary drop-shadow-sm"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </div>

      {/* UI */}
      <div
        className="flex flex-col items-center gap-3"
        style={{
          animation: "node-enter 0.5s ease-out 0.3s forwards",
          opacity: 0,
        }}
      >
        <div className="flex h-20 w-20 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-border/60 bg-card shadow-md transition-all duration-300 hover:border-primary/30 hover:shadow-lg sm:h-24 sm:w-24 dark:border-white/10">
          <LayoutPanelTop
            className="size-7 text-primary sm:size-8"
            strokeWidth={2}
          />
          <span className="text-xs font-semibold text-primary sm:text-sm">
            UI
          </span>
        </div>
        <span className="text-xs uppercase tracking-wider text-muted-foreground">
          Logs · Docs
        </span>
      </div>
    </div>
  );
}

export function HowItWorks() {
  return (
    <section id="how-it-works" className="section">
      <div className="section-content heading">
        <Decorations />
        <p className="text-xs font-medium uppercase tracking-widest text-primary/80 dark:text-primary/90">
          How it works
        </p>
        <h2 className="heading-content mt-2">Three steps. One integration.</h2>
      </div>

      <div>
        <div className="section-content">
          <Decorations />
          <div className="rounded-xl border border-border/50 bg-muted/20 dark:border-white/10 dark:bg-muted/5">
            <FlowDiagram />
          </div>
        </div>

        <div className="section-content">
          <Decorations />
          <div className="grid sm:grid-cols-3">
            {steps.map(({ step, title, icon: Icon, content }) => (
              <div
                key={step}
                className={cn(
                  "relative flex flex-col gap-4 border-r border-b border-border/50 bg-card p-6 dark:border-white/10",
                  "transition-colors hover:border-primary/20 hover:bg-muted/30 dark:hover:bg-muted/10",
                )}
              >
                <Decorations />
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">
                      Step {step}
                    </span>
                    <h3 className="text-base font-semibold tracking-tight text-foreground">
                      {title}
                    </h3>
                  </div>
                </div>
                <div className="min-h-[60px]">{content}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
