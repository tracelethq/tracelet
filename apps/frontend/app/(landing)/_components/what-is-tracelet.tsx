import PatternDivider from "@/components/pattern-divider";
import Decorations from "@/components/ui/decorations";

const sections = [
  {
    title: "The problem",
    blockquote: "Every tool asks you to describe your API again.",
    points: [
      "APIs don't fail because of code — they fail because of visibility gaps.",
      "Logs live in one place, docs live in another.",
      "None of them stay in sync.",
    ],
  },
  {
    title: "divider",
    blockquote: "",
    points: [],
  },
  {
    title: "How Tracelet solves it",
    blockquote: "Tracelet watches your API instead.",
    points: [
      "Runtime API observability layer for Express apps.",
      "API Documentation and Structured Request & Response Logs.",
      "All from the same source of truth: your running Express application.",
    ],
  },
];

export function WhatIsTracelet() {
  return (
    <section id="what-is-tracelet" className="section">
      <div className="section-content heading">
        <Decorations />
        <p className="text-xs font-medium uppercase tracking-widest text-primary/80 dark:text-primary/90">
          What is Tracelet
        </p>
        <h2 className="heading-content mt-2">
          Runtime API observability for Express
        </h2>
      </div>
      <div className="section-content">
        <Decorations />
        <div className="grid-section-wrapper sm:grid-cols-[1fr_16px_1fr]!">
          {sections.map(({ title, blockquote, points }) => title === "divider" ? (
            <PatternDivider key={title} size={4} direction="vertical" />
          ) : (
            <div key={title} className="grid-section-item">
              <Decorations />
              <h3 className="text-lg font-semibold tracking-tight text-foreground">
                {title}
              </h3>
              <blockquote className="rounded-r-lg border-l-4 border-primary bg-muted/50 py-3 pl-4 pr-4 italic text-muted-foreground dark:bg-muted/20">
                {blockquote}
              </blockquote>
              <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground leading-relaxed">
                {points.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
