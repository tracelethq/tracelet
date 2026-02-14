"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useCommandState } from "cmdk";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { ROUTES, LINKS } from "@/config/constants";
import {
  HomeIcon,
  BookOpenIcon,
  RocketIcon,
  GithubIcon,
  SearchIcon,
  CornerDownLeftIcon,
  FileTextIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Decorations from "./ui/decorations";

type GlobalSearchContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  docPages: DocsPageItem[];
  searchResults: DocsPageItem[];
  setSearchResults: React.Dispatch<React.SetStateAction<DocsPageItem[]>>;
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

export type DocsPageItem = {
  slug: string[];
  href: string;
  title: string;
  /** Set when listing all docs (no search). */
  excerpt?: string;
  /** Set when results come from full-content search (has search query). */
  snippet?: string;
};

const staticNavItems = [
  { label: "Home", href: ROUTES.home, icon: HomeIcon, sublabel: null },
  { label: "Docs", href: ROUTES.docs, icon: BookOpenIcon, sublabel: null },
  {
    label: "Get started",
    href: ROUTES.docsDevelopers,
    icon: RocketIcon,
    sublabel: "Developer docs",
  },
  {
    label: "GitHub",
    href: LINKS.github,
    icon: GithubIcon,
    external: true,
    sublabel: null,
  },
];

/** Wraps matched substring in <mark> (same as sdk-ui route-command-palette). */
function highlightMatch(text: string, search: string): React.ReactNode {
  if (!search.trim()) return text;
  const lower = text.toLowerCase();
  const searchLower = search.trim().toLowerCase();
  const idx = lower.indexOf(searchLower);
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-primary/15 text-primary rounded px-0.5 font-medium">
        {text.slice(idx, idx + search.trim().length)}
      </mark>
      {highlightMatch(text.slice(idx + search.trim().length), search)}
    </>
  );
}

function DocPageList({
  pages,
  search,
  onSelect,
}: {
  pages: DocsPageItem[];
  search: string;
  onSelect: (item: DocsPageItem) => void;
}) {
  if (pages.length === 0) return null;

  /** e.g. ["sdk", "express", "get-started"] → "sdk › express" */
  const pathLabel = (slug: string[]) => {
    if (slug.length <= 1) return null;
    return slug.slice(0, -1).join(" › ");
  };

  return (
    <CommandGroup heading="Documentation">
      {pages.map((page) => {
        const snippet = page.snippet ?? "";
        const path = pathLabel(page.slug);
        return (
          <CommandItem
            key={page.href}
            value={`${page.title} ${page.href} ${page.slug.join(" ")} ${snippet} ${page.excerpt ?? ""}`}
            onSelect={() => onSelect(page)}
          >
            <FileTextIcon className="size-3.5 shrink-0" />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="truncate font-medium">
                {highlightMatch(page.title, search)}
              </span>
              {(path || snippet) && (
                <span className="text-muted-foreground line-clamp-2 text-[11px] leading-snug">
                  {path && <span className="font-mono">{path}</span>}
                  {path && snippet && " · "}
                  {snippet ? highlightMatch(snippet, search) : null}
                </span>
              )}
            </div>
          </CommandItem>
        );
      })}
    </CommandGroup>
  );
}

function StaticNavList({
  onSelect,
}: {
  onSelect: (item: (typeof staticNavItems)[number]) => void;
}) {
  const search = useCommandState((state) => state.search ?? "");
  if (search.trim()) return null;

  return (
    <CommandGroup heading="Pages">
      {staticNavItems.map((item) => {
        const Icon = item.icon;
        const sublabel = "sublabel" in item ? item.sublabel : null;
        return (
          <CommandItem
            key={item.href + item.label}
            value={`${item.label} ${item.href} ${sublabel ?? ""}`}
            onSelect={() => onSelect(item)}
          >
            <Icon className="size-3.5 shrink-0" />
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span>{item.label}</span>
              {sublabel && (
                <span className="text-muted-foreground text-[11px] leading-snug">
                  {sublabel}
                </span>
              )}
            </div>
          </CommandItem>
        );
      })}
    </CommandGroup>
  );
}

const SEARCH_DEBOUNCE_MS = 180;

/** Runs inside Command; fetches full-content search when user types (debounced). */
function DocSearchFetch() {
  const search = useCommandState((state) => state.search ?? "");
  const { setSearchResults } = useGlobalSearch();

  React.useEffect(() => {
    const q = search.trim();
    if (!q) {
      setSearchResults([]);
      return;
    }
    const t = setTimeout(() => {
      let cancelled = false;
      fetch(`/api/docs-pages?q=${encodeURIComponent(q)}`)
        .then((res) => (res.ok ? res.json() : []))
        .then((data: DocsPageItem[]) => {
          if (!cancelled) setSearchResults(Array.isArray(data) ? data : []);
        })
        .catch(() => {
          if (!cancelled) setSearchResults([]);
        });
      return () => {
        cancelled = true;
      };
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [search, setSearchResults]);

  return null;
}

/** Picks doc list and search from command state; renders Pages + Doc list. */
function DocListWithSearch({
  onSelectDoc,
  onSelectNav,
}: {
  onSelectDoc: (item: DocsPageItem) => void;
  onSelectNav: (item: (typeof staticNavItems)[number]) => void;
}) {
  const search = useCommandState((state) => state.search ?? "");
  const { docPages, searchResults } = useGlobalSearch();
  const pages = search.trim() ? searchResults : docPages;

  return (
    <>
      <StaticNavList onSelect={onSelectNav} />
      <DocSearchFetch />
      <DocPageList pages={pages} search={search} onSelect={onSelectDoc} />
    </>
  );
}

export function GlobalSearchProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const [docPages, setDocPages] = React.useState<DocsPageItem[]>([]);
  const [searchResults, setSearchResults] = React.useState<DocsPageItem[]>([]);
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

  React.useEffect(() => {
    if (!open) return;
    let cancelled = false;
    fetch("/api/docs-pages")
      .then((res) => (res.ok ? res.json() : []))
      .then((data: DocsPageItem[]) => {
        if (!cancelled) setDocPages(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setDocPages([]);
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  const runNav = React.useCallback(
    (item: (typeof staticNavItems)[number]) => {
      setOpen(false);
      if ("external" in item && item.external) {
        window.open(item.href, "_blank", "noopener,noreferrer");
      } else {
        router.push(item.href);
      }
    },
    [router]
  );

  const runDoc = React.useCallback((page: DocsPageItem) => {
    setOpen(false);
    router.push(page.href);
  }, [router]);

  return (
    <GlobalSearchContext.Provider
      value={{ open, setOpen, docPages, searchResults, setSearchResults }}
    >
      {children}
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Search"
        description="Search documentation and pages."
        className="border-4"
      >
        <div className="flex flex-col">
          <Command
            className="flex flex-col border-0 bg-transparent shadow-none [&_[data-slot=command-input-wrapper]>div]:rounded-lg **:data-[slot=command-item]:rounded-lg"
            shouldFilter={false}
          >
            <CommandInput placeholder="Search by title, path, or doc content..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <DocListWithSearch onSelectDoc={runDoc} onSelectNav={runNav} />
            </CommandList>
          </Command>
          <div
            className="flex items-center gap-2 border-t border-border bg-border px-3 py-2.5 text-xs text-muted-foreground"
            aria-hidden
          >
            <CornerDownLeftIcon className="size-3.5 shrink-0" />
            <span>Go to Page</span>
            <KbdGroup className="ml-auto">
              <Kbd>⌘</Kbd>
              <Kbd>K</Kbd>
            </KbdGroup>
          </div>
        </div>
      </CommandDialog>
    </GlobalSearchContext.Provider>
  );
}

export function GlobalSearchTrigger({
  className,
  ...props
}: React.ComponentProps<"button">) {
  const { setOpen } = useGlobalSearch();

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className={cn("relative group", className)}
      aria-label="Search"
      {...props}
    >
      <Decorations className="hidden sm:block"/>
      <SearchIcon className="size-4" />
      <span className="hidden sm:inline">Search</span>
      <KbdGroup className="hidden sm:inline-flex">
        <Kbd>⌘</Kbd>
        <Kbd>K</Kbd>
      </KbdGroup>
    </button>
  );
}

export { useGlobalSearch };
