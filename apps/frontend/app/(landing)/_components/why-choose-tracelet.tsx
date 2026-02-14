import {
  BookOpenIcon,
  FileCodeIcon,
  MoonIcon,
  SunIcon,
  TypeIcon,
  ZapIcon,
} from "lucide-react";
import { sectionClass, headingClass } from "./constants";
import Decorations from "@/components/ui/decorations";

const features = [
  {
    title: "Production ready",
    description:
      "Ship without maintaining three separate tools. One integration, one UI.",
    icon: ZapIcon,
  },
  {
    title: "Dark mode compatible",
    description: "Full light and dark theme support. Matches your environment.",
    icon: null,
    visual: (
      <div className="flex w-fit overflow-hidden rounded-xl border border-border/60 shadow-sm dark:border-white/10">
        <div className="flex h-9 w-9 items-center justify-center bg-background">
          <SunIcon className="size-4 text-amber-500" />
        </div>
        <div className="flex h-9 w-9 items-center justify-center bg-muted">
          <MoonIcon className="size-4 text-muted-foreground" />
        </div>
      </div>
    ),
  },
  {
    title: "Logs · Docs",
    description: "Two capabilities in one place. Always in sync with your API.",
    icons: [FileCodeIcon, BookOpenIcon],
  },
  {
    title: "Built for developers",
    description:
      "No route changes, no type hacks, no extra build step. Opt-in and runtime-aware.",
    icon: ZapIcon,
  },
  {
    title: "TypeScript based",
    description:
      "Express-native, type-safe, and designed for modern Node apps.",
    icon: TypeIcon,
  },
  {
    title: "Copy & paste setup",
    description: "Install, mount, run. Everything appears at /tracelet-docs.",
    icon: FileCodeIcon,
  },
];

export function WhyChooseTracelet() {
  return (
    <section id="why-choose" className="section">
      <div className="section-content heading">
        <Decorations />
        <p className="text-xs font-medium uppercase tracking-widest text-primary/80 dark:text-primary/90">
          Why choose Tracelet
        </p>
        <h2 className={"heading-content mt-2"}>One integration. One UI.</h2>
      </div>
      <div className="section-content">
        <Decorations />
        <div className="grid-section-wrapper lg:grid-cols-3!">
          {features.map(({ title, description, icon: Icon, visual, icons }) => (
            <div key={title} className="grid-section-item">
              <Decorations />
              {visual ? (
                <div>{visual}</div>
              ) : icons ? (
                <div className="flex gap-2">
                  {icons.map((Ico, i) => (
                    <span
                      key={i}
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"
                    >
                      <Ico className="size-5" />
                    </span>
                  ))}
                </div>
              ) : Icon ? (
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </div>
              ) : null}
              <h3 className="text-lg font-semibold tracking-tight text-foreground">
                {title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
