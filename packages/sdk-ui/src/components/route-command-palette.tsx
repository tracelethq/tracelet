"use client"

import * as React from "react"
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
import { SearchIcon } from "lucide-react"
import type { RouteMeta } from "@/types/route"

type RouteCommandPaletteProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  routes: RouteMeta[]
  onSelectRoute: (route: RouteMeta) => void
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
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-0.5 rounded border border-border bg-muted/50 px-1 font-mono text-[10px] font-medium sm:inline-flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog
        open={open}
        onOpenChange={onOpenChange}
        title="Search API routes"
        description="Search and jump to an API route."
      >
        <Command className="rounded-lg border-0 shadow-none">
          <CommandInput placeholder="Search by method or path..." />
          <CommandList>
            <CommandEmpty>No routes found.</CommandEmpty>
            <CommandGroup heading="API routes">
              {routes.map((route) => {
                const label = `${route.method} ${route.path}`
                return (
                  <CommandItem
                    key={`${route.method}:${route.path}`}
                    value={label}
                    onSelect={() => handleSelect(route)}
                  >
                    <span className="font-mono text-xs font-medium text-primary">
                      {route.method}
                    </span>
                    <span className="truncate">{route.path}</span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  )
}
