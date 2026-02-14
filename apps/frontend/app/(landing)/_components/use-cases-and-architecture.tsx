"use client";

import { BugIcon } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import "@/styles/animations.css";
import Decorations from "@/components/ui/decorations";
import PatternDivider from "@/components/pattern-divider";

const useCases = [
  "Local development visibility",
  "Internal service documentation",
  "Debugging request/response issues",
  "Frontend ↔ backend collaboration",
  "Onboarding new engineers",
  "Microservice observability",
];

const architectureItems = [
  "Express-native",
  "TypeScript-first",
  "No vendor lock-in",
  "Metadata is exportable",
  "UI runs on the same port as your API",
];

function UseCasesList({ items }: { items: string[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLUListElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  const checkOverflow = () => {
    const container = containerRef.current;
    const measure = measureRef.current;
    if (!container || !measure) return;
    setIsOverflowing(measure.scrollWidth > container.clientWidth);
  };

  useLayoutEffect(() => {
    checkOverflow();
    const ro = new ResizeObserver(checkOverflow);
    const el = containerRef.current;
    if (el) ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const listItemClass =
    "shrink-0 whitespace-nowrap border border-border bg-muted/40 px-4 py-2 text-center text-sm transition-colors hover:border-primary/20 hover:bg-muted/60 dark:bg-muted/20 dark:hover:bg-muted/40";

  return (
    <div ref={containerRef} className="relative">
      <ul
        ref={measureRef}
        className="pointer-events-none invisible absolute left-0 top-0 flex w-max gap-2 opacity-0"
        aria-hidden
      >
        {items.map((item) => (
          <li key={item} className={listItemClass}>
            {item}
          </li>
        ))}
      </ul>
      <div
        className={cn(
          isOverflowing && "overflow-hidden mask-[linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]"
        )}
      >
        <ul
          className={cn(
            "flex text-muted-foreground",
            isOverflowing ? "w-max animate-[marquee_30s_linear_infinite]" : "flex-wrap"
          )}
        >
          {(isOverflowing ? [...items, ...items] : items).map((item, i) => (
            <li key={isOverflowing ? `${item}-${i}` : item} className={listItemClass}>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ArchitectureList({ items }: { items: string[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLUListElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  const checkOverflow = () => {
    const container = containerRef.current;
    const measure = measureRef.current;
    if (!container || !measure) return;
    setIsOverflowing(measure.scrollWidth > container.clientWidth);
  };

  useLayoutEffect(() => {
    checkOverflow();
    const ro = new ResizeObserver(checkOverflow);
    const el = containerRef.current;
    if (el) ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const listItemClass =
    "shrink-0 whitespace-nowrap border border-border bg-muted/40 px-4 py-2 text-center text-sm md:text-xl transition-colors hover:border-primary/20 hover:bg-muted/60 dark:bg-muted/20 dark:hover:bg-muted/40 flex items-center gap-2 flex-1";

  return (
    <div ref={containerRef} className="relative">
      {/* Hidden element to measure single-row width */}
      <ul
        ref={measureRef}
        className="pointer-events-none invisible absolute left-0 top-0 flex w-max gap-2 opacity-0"
        aria-hidden
      >
        {items.map((item) => (
          <li key={item} className={listItemClass}>
            <BugIcon className="size-3.5 shrink-0 text-primary" />
            {item}
          </li>
        ))}
      </ul>
      <div
        className={cn(
          isOverflowing && "overflow-hidden mask-[linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]"
        )}
      >
        <ul
          className={cn(
            "flex text-muted-foreground",
            isOverflowing ? "w-max animate-[marquee_30s_linear_infinite]" : "flex-wrap"
          )}
        >
          {(isOverflowing ? [...items, ...items] : items).map((item, i) => (
            <li key={isOverflowing ? `${item}-${i}` : item} className={listItemClass}>
              <BugIcon className="size-3.5 shrink-0 text-primary" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function UseCasesAndArchitecture() {
  return (
    <section id="use-cases" className="section">
      <div className="section-content heading">
        <Decorations />
        <h2 className="heading-content">Typical use cases</h2>
      </div>
      <div className="section-content">
        <Decorations />
        <UseCasesList items={useCases} />
      </div>
      <PatternDivider size={4} />
      <div className="section-content heading">
        <Decorations />
        <h2 className="heading-content">Architecture-friendly by design</h2>
      </div>
      <div className="section-content">
        <Decorations />
        <ArchitectureList items={architectureItems} />
      </div>
    </section>
  );
}
