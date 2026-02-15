"use client"

import "@/styles/animations.css"
import {
  BookOpen,
  FileCode,
  Play,
  Zap,
  Server,
  ScanSearch,
  Braces,
  Terminal,
  type LucideIcon,
} from "lucide-react"
import Decorations from "@/components/ui/decorations"
import { cn } from "@/lib/utils"

const leftFeatures: { icon: LucideIcon; label: string }[] = [
  { icon: Zap, label: "Instant setup" },
  { icon: BookOpen, label: "Live docs" },
  { icon: FileCode, label: "Structured logs" },
  { icon: Server, label: "Express" },
  { icon: ScanSearch, label: "Runtime observe" },
]

const rightFeatures: { icon: LucideIcon; label: string }[] = [
  { icon: Braces, label: "Request logs" },
  { icon: FileCode, label: "Response logs" },
  { icon: Terminal, label: "One integration" },
  { icon: BookOpen, label: "API docs" },
  { icon: Zap, label: "TypeScript" },
]

function FeatureBox({
  features,
  className,
  animationDelay = "0ms",
}: {
  features: { icon: LucideIcon; label: string }[]
  className?: string
  animationDelay?: string
}) {
  return (
    <div
      className={cn(
        "flex gap-4 justify-between md:justify-items-center rounded-2xl border-2 border-primary/30 bg-card/80 px-6 py-5 shadow-lg shadow-primary/5 transition-all duration-300 hover:border-primary/50 dark:border-primary/20 dark:bg-muted/10 dark:hover:border-primary/40 md:flex md:justify-center md:gap-4",
        className
      )}
      style={{
        animation: `node-enter 0.5s ease-out ${animationDelay} forwards`,
        opacity: 0,
      }}
    >
      {features.map(({ icon: Icon, label }, i) => (
        <div
          key={label}
          className="flex flex-col items-center gap-1.5 transition-opacity duration-200"
          style={{
            animation: `icon-fade-in 0.4s ease-out ${30 * i}ms forwards`,
            opacity: 0,
          }}
          title={label}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-muted/50 dark:border-primary/10 dark:bg-muted/20">
            <Icon className="size-5 text-primary" strokeWidth={2} />
          </div>
          <span className="text-[10px] font-medium text-muted-foreground text-center sr-only">
            {label}
          </span>
        </div>
      ))}
    </div>
  )
}

export function DesignedFor() {
  return (
    <section id="designed-for" className="section">
      <div className="section-content heading">
        <Decorations />
        <p className="text-xs font-medium uppercase tracking-widest text-primary/80 dark:text-primary/90">
          Built for devs
        </p>
        <h2 className="heading-content mt-2">
          Designed for developers
        </h2>
      </div>

      <div className="section-content">
        <Decorations />
        <div className="flex flex-col items-center gap-0 px-4 py-12 md:px-8 md:py-16">
          {/* Mobile: vertical flow (top box → line → diamond → line → bottom box) | Desktop: horizontal */}
          <div className="flex w-full max-w-5xl flex-col items-center gap-4 md:flex-row md:items-center md:gap-4">
            {/* Top box (mobile) / Left box (desktop) */}
            <FeatureBox
              features={leftFeatures}
              animationDelay="0.1s"
              className="order-1 w-full md:order-1 md:flex-1 md:mb-7"
            />

            {/* Vertical line: top box → diamond (mobile only) */}
            <div
              className="order-2 h-8 w-px shrink-0 self-center bg-primary/60 md:hidden"
              aria-hidden
            />

            {/* Horizontal line: left box → diamond (desktop only) */}
            <div
              className="order-2 hidden h-px flex-1 self-center bg-primary/60 md:order-2 md:block md:mb-7"
              aria-hidden
            />

            {/* Center diamond */}
            <div
              className="order-3 flex shrink-0 flex-col items-center justify-center md:order-3"
              style={{ animation: "node-enter 0.6s ease-out forwards" }}
            >
              <div
                className={cn(
                  "relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-lg",
                  "rotate-45",
                  "border-2 border-primary/60 bg-primary/10 shadow-xl shadow-primary/20",
                  "animate-[diamond-pulse_3s_ease-in-out_infinite]",
                  "transition-all duration-300 hover:border-primary/80 hover:shadow-2xl",
                  "dark:border-primary/50 dark:bg-primary/15 dark:shadow-primary/25"
                )}
              >
                <div className="-rotate-45 flex flex-col items-center gap-0">
                  <Zap className="size-8 text-primary" strokeWidth={2} />
                  <span className="text-[9px] font-bold text-primary">
                    Tracelet
                  </span>
                </div>
              </div>
              <p className="mt-3 text-center text-[11px] font-medium text-muted-foreground">
                API observability
              </p>
            </div>

            {/* Vertical line: diamond → bottom box (mobile only) */}
            <div
              className="order-4 h-8 w-px shrink-0 self-center bg-primary/60 md:hidden"
              aria-hidden
            />

            {/* Horizontal line: diamond → right box (desktop only) */}
            <div
              className="order-4 hidden h-px flex-1 self-center bg-primary/60 md:order-4 md:block md:mb-7"
              aria-hidden
            />

            {/* Bottom box (mobile) / Right box (desktop) */}
            <FeatureBox
              features={rightFeatures}
              animationDelay="0.2s"
              className="order-5 w-full md:order-5 md:max-w-[320px] md:flex-1 md:mb-7"
            />
          </div>

          <p className="relative z-10 mt-6 text-center text-sm text-muted-foreground">
            Opt-in, runtime-aware, and non-intrusive.
          </p>
        </div>
      </div>
    </section>
  )
}
