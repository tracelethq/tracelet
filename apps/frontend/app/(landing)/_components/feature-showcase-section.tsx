"use client";

import { CodeBlock } from "@/components/code-block";
import { AnimatedBrowser } from "@/components/svg/animated-browser";
import { ZapIcon, BookOpenIcon, FileCodeIcon, PlayIcon } from "lucide-react";
import Image from "next/image";
import Decorations from "@/components/ui/decorations";
import CustomImage from "@/components/custom-image";

const tabs = [
  {
    id: "instant",
    label: "Instant setup",
    icon: ZapIcon,
    title: "One integration. One UI.",
    description:
      "Add a single middleware. Tracelet captures routes, logs traffic, and serves docs. No decorators, no schema definitions.",
    content: "code",
    code: `import express from "express";
import { traceletExpress } from "@tracelet/express";

const app = express();

// Init Tracelet
traceletExpress({app, serviceName: "Your API", environment: "local"});

// Your routes — Tracelet observes them automatically
app.get("/users/:id", (req, res) => {
  res.json({ id: req.params.id, name: "Jane" });
});

app.listen(3000);
`,
    language: "typescript",
  },
  {
    id: "docs",
    label: "Live docs",
    icon: BookOpenIcon,
    title: "Docs from real routes.",
    description:
      "Documentation generated from your running API. Params, body, headers, and response types stay in sync — always.",
    content: "visual",
  },
  {
    id: "logs",
    label: "Structured logs",
    icon: FileCodeIcon,
    title: "Production-ready logging.",
    description:
      "Request context, payload shapes, response status, and timing. Everything you need to debug without extra tooling.",
    content: "code",
    code: `[Your API] GET    /ping
  304 REDIRECT  4ms  0 B  req:cbb17bc0  trace:cbb17bc0
  2026-02-20T07:01:18.282Z
payload: { ... }`,
    language: "text",
  },
  {
    id: "try",
    label: "Try it out",
    icon: PlayIcon,
    title: "Send requests in the browser.",
    description:
      "Edit params, headers, and body. See real responses. Perfect for debugging and sharing with your team.",
    content: "browser",
  },
] as const;

export function FeatureShowcaseSection() {
  return (
    <section id="product" className="section">
      <div className="section-content heading">
        <Decorations />
        <h2 className="heading-content">Redefining API observability</h2>
      </div>

      <div className="section-content">
        <Decorations />
        <div className="grid-section-wrapper min-w-0">
          {tabs.map((tab) => (
            <div key={tab.id} className="grid-section-item min-w-0">
              <Decorations />
              <h3 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                {tab.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {tab.description}
              </p>

              <div className="mt-2 min-w-0 border border-border/50 bg-muted dark:border-white/10 dark:bg-white/5">
                {tab.content === "code" && tab.code ? (
                  <CodeBlock
                    code={tab.code}
                    language={tab.language ?? "typescript"}
                    variant="terminal"
                  />
                ) : tab.content === "browser" ? (
                  <AnimatedBrowser />
                ) : (
                  <div className="relative aspect-video w-full">
                    <CustomImage
                      src="/docs-sample.png"
                      alt="Tracelet docs UI showing API routes and try-it panel"
                      fill
                      className="object-contain object-top"
                      sizes="(min-width: 640px) 50vw, 100vw"
                      loading="eager"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
