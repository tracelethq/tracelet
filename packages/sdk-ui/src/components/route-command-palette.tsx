"use client"

import * as React from "react"
import { useCommandState } from "cmdk"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Button } from "@/components/ui/button"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { getMethodColors } from "@/components/routes-sidebar"
import { CornerDownLeftIcon, SearchIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import type { RouteMeta } from "@/types/route"

type RouteCommandPaletteProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  routes: RouteMeta[]
  onSelectRoute: (route: RouteMeta) => void
}

/** Splits text by search (case-insensitive) and wraps matches in <mark>. */
function highlightMatch(text: string, search: string): React.ReactNode {
  if (!search.trim()) return text
  const lower = text.toLowerCase()
  const searchLower = search.trim().toLowerCase()
  const idx = lower.indexOf(searchLower)
  if (idx === -1) return text
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-primary/15 text-primary rounded px-0.5 font-medium">
        {text.slice(idx, idx + search.trim().length)}
      </mark>
      {highlightMatch(text.slice(idx + search.trim().length), search)}
    </>
  )
}

function RouteList({
  routes,
  onSelect,
}: {
  routes: RouteMeta[]
  onSelect: (route: RouteMeta) => void
}) {
  const search = useCommandState((state) => state.search ?? "")
  const searchLower = search.trim().toLowerCase()
  const hasSearch = searchLower.length > 0

  return (
    <CommandGroup heading="API routes">
      {routes.map((route) => {
        const searchableValue = [
          route.method,
          route.path,
          route.description ?? "",
        ]
          .filter(Boolean)
          .join(" ")
        const desc = route.description?.trim() ?? ""
        const descriptionMatches =
          hasSearch && desc.length > 0 && desc.toLowerCase().includes(searchLower)
        const showDescription = descriptionMatches

        return (
          <CommandItem
            key={`${route.method}:${route.path}`}
            value={searchableValue}
            onSelect={() => onSelect(route)}
          >
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={cn(
                    getMethodColors(
                      typeof route.method === "string"
                        ? route.method
                        : String(route.method)
                    ),
                    "inline-flex h-5 min-w-9 items-center justify-center px-1.5 py-0.5"
                  )}
                >
                  {typeof route.method === "string"
                    ? route.method
                    : String(route.method)}
                </span>
                <span className="truncate text-xs font-mono">
                  {highlightMatch(route.path, search)}
                </span>
              </div>
              {showDescription && (
                <span className="text-muted-foreground line-clamp-2 text-[11px] leading-snug">
                  {highlightMatch(route.description ?? "", search)}
                </span>
              )}
            </div>
          </CommandItem>
        )
      })}
    </CommandGroup>
  )
}

export function RouteCommandPalette({
  open,
  onOpenChange,
  routes,
  onSelectRoute,
}: RouteCommandPaletteProps) {
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onOpenChange(!open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [open, onOpenChange])

  const handleSelect = React.useCallback(
    (route: RouteMeta) => {
      onSelectRoute(route)
      onOpenChange(false)
    },
    [onSelectRoute, onOpenChange]
  )

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="h-8 gap-1.5 text-muted-foreground"
        onClick={() => onOpenChange(true)}
      >
        <SearchIcon className="size-3.5" />
        <span className="hidden sm:inline">Search routes</span>
        <KbdGroup className="hidden sm:inline-flex">
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
      </Button>
      <CommandDialog
        open={open}
        onOpenChange={onOpenChange}
        title="Search API routes"
        description="Search and jump to an API route."
        className="border-4"
      >
        <div className="flex flex-col">
          <Command className="flex flex-col border-0 bg-transparent shadow-none [&_[data-slot=command-input-wrapper]>div]:rounded-lg **:data-[slot=command-item]:rounded-lg">
            <CommandInput placeholder="Search by method, path, or description..." />
            <CommandList>
              <CommandEmpty>No routes found.</CommandEmpty>
              <RouteList routes={routes} onSelect={handleSelect} />
            </CommandList>
          </Command>
          <div
            className="flex items-center gap-2 border-t border-border bg-border px-3 py-2.5 text-xs text-muted-foreground"
            aria-hidden
          >
            <CornerDownLeftIcon className="size-3.5 shrink-0" />
            <span>Go to Route</span>
            <KbdGroup className="ml-auto">
              <Kbd>⌘</Kbd>
              <Kbd>K</Kbd>
            </KbdGroup>
          </div>
        </div>
      </CommandDialog>
    </>
  )
}
