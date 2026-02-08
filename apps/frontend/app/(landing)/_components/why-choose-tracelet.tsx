import {
  BookOpenIcon,
  FileCodeIcon,
  FlaskConicalIcon,
  MoonIcon,
  SunIcon,
  TypeIcon,
  ZapIcon,
} from "lucide-react";
import { sectionClass, headingClass } from "./constants";

const features = [
  {
    title: "Production ready",
    description: "Ship without maintaining three separate tools. One integration, one UI.",
    icon: ZapIcon,
  },
  {
    title: "Dark mode compatible",
    description: "Full light and dark theme support. Matches your environment.",
    icon: null,
    visual: (
      <div className="flex gap-1 rounded-lg border border-border bg-muted/30 p-1.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-background shadow-sm">
          <SunIcon className="size-4 text-amber-500" />
        </span>
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-muted shadow-sm">
          <MoonIcon className="size-4 text-muted-foreground" />
        </span>
      </div>
    ),
  },
  {
    title: "Logs · Docs · Testing",
    description: "Three capabilities in one place. Always in sync with your API.",
    icons: [FileCodeIcon, BookOpenIcon, FlaskConicalIcon],
  },
  {
    title: "Built for developers",
    description: "No route changes, no type hacks, no extra build step. Opt-in and runtime-aware.",
    icon: ZapIcon,
  },
  {
    title: "TypeScript based",
    description: "Express-native, type-safe, and designed for modern Node apps.",
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
    <section id="why-choose" className={sectionClass}>
      <p className="text-xs font-medium uppercase tracking-widest text-primary/80 dark:text-primary/90">
        Why choose Tracelet
      </p>
      <h2 className={headingClass + " mt-2"}>One integration. One UI.</h2>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map(({ title, description, icon: Icon, visual, icons }) => (
          <div
            key={title}
            className="group rounded-2xl border border-border bg-card p-6 transition-all duration-200 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 dark:hover:shadow-primary/10"
          >
            {visual ? (
              <div className="mb-4">{visual}</div>
            ) : icons ? (
              <div className="mb-4 flex gap-2">
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
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="size-5" />
              </div>
            ) : null}
            <h3 className="text-lg font-semibold tracking-tight text-foreground">
              {title}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
