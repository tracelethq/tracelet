"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { ROUTES, LINKS } from "@/config/constants";
import {
  HomeIcon,
  BookOpenIcon,
  RocketIcon,
  GithubIcon,
  SearchIcon,
  CornerDownLeftIcon,
} from "lucide-react";

type GlobalSearchContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const GlobalSearchContext = React.createContext<
  GlobalSearchContextValue | undefined
>(undefined);

function useGlobalSearch() {
  const ctx = React.useContext(GlobalSearchContext);
  if (ctx === undefined) {
    throw new Error("useGlobalSearch must be used within GlobalSearchProvider");
  }
  return ctx;
}

const searchItems = [
  { label: "Home", href: ROUTES.home, icon: HomeIcon },
  { label: "Docs", href: ROUTES.docs, icon: BookOpenIcon },
  { label: "Get started", href: ROUTES.docsUsing, icon: RocketIcon },
  {
    label: "GitHub",
    href: LINKS.github,
    icon: GithubIcon,
    external: true,
  },
];

export function GlobalSearchProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const run = React.useCallback(
    (item: (typeof searchItems)[number]) => {
      setOpen(false);
      if (item.external) {
        window.open(item.href, "_blank", "noopener,noreferrer");
      } else {
        router.push(item.href);
      }
    },
    [router]
  );

  return (
    <GlobalSearchContext.Provider value={{ open, setOpen }}>
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="overflow-hidden p-0 [&>button]:hidden border-4"
          aria-describedby={undefined}
        >
          <DialogTitle className="sr-only">Search</DialogTitle>
          <Command
            className="flex flex-col border-0 bg-transparent shadow-none [&_[data-slot=command-input-wrapper]>div]:rounded-lg **:data-[slot=command-list]:max-h-64 **:data-[slot=command-item]:rounded-lg [&_[data-slot=command-item]>svg:last-child]:hidden"
            loop
          >
            <CommandInput placeholder="Search documentation..." />
            <CommandList>
              <CommandEmpty className="py-6">
                No results found.
              </CommandEmpty>
              <CommandGroup heading="Pages">
                {searchItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <CommandItem
                      key={item.href + item.label}
                      value={`${item.label} ${item.href}`}
                      onSelect={() => run(item)}
                    >
                      <Icon className="size-4 shrink-0" />
                      {item.label}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
          <div
            className="flex items-center gap-2 border-t border-border bg-border px-3 py-2.5 text-xs text-muted-foreground"
            aria-hidden
          >
            <CornerDownLeftIcon className="size-3.5 shrink-0" />
            <span>Go to Page</span>
          </div>
        </DialogContent>
      </Dialog>
    </GlobalSearchContext.Provider>
  );
}

export function GlobalSearchTrigger({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { setOpen } = useGlobalSearch();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => setOpen(true)}
      className={className}
      aria-label="Search"
      {...props}
    >
      <SearchIcon className="size-4" />
      <span className="hidden sm:inline">Search</span>
      <kbd className="rounded border border-border/60 bg-background/80 px-1.5 py-0.5 font-mono text-[10px] dark:border-border dark:bg-muted/50">
        ⌘K
      </kbd>
    </Button>
  );
}

export { useGlobalSearch };
