"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDownIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type DocMeta } from "@/lib/docs-mdx";
import { getIconForMeta } from "./mdx-renderer";

const navLinkClass =
  "flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors w-full text-left";

function isDocsGroup(meta: DocMeta): boolean {
  const first = meta.slug[0]
  return first !== "sdk" && first !== "api-explorer"
}

function isApiTesterGroup(meta: DocMeta): boolean {
  return meta.slug[0] === "api-explorer"
}

function isSdkGroup(meta: DocMeta): boolean {
  return meta.slug[0] === "sdk"
}

/** Group SDK docs by sdk name (slug[1]: express, core, ...) then list pages. */
function groupSdkDocs(sdkLinks: DocMeta[]): Map<string, DocMeta[]> {
  const bySdk = new Map<string, DocMeta[]>()
  for (const meta of sdkLinks) {
    const name = meta.slug[1] ?? "sdk"
    if (!bySdk.has(name)) bySdk.set(name, [])
    bySdk.get(name)!.push(meta)
  }
  for (const arr of bySdk.values()) {
    arr.sort((a, b) => a.href.localeCompare(b.href))
  }
  return bySdk
}

const SDK_LABELS: Record<string, string> = {
  express: "Express",
  core: "Core",
}


const subNavLinkClass =
  "flex items-center gap-2 rounded-md py-1.5 pl-3 pr-2 text-sm transition-colors w-full text-left -ml-px border-l-2 border-transparent"

export function DocsNav({ mdxDocs = [] }: { mdxDocs?: DocMeta[] }) {
  const pathname = usePathname()
  const docsLinks = mdxDocs.filter(isDocsGroup)
  const apiTesterLinks = mdxDocs.filter(isApiTesterGroup)
  const sdkLinks = mdxDocs.filter(isSdkGroup)
  const sdkByGroup = groupSdkDocs(sdkLinks)

  const [openSdks, setOpenSdks] = React.useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    for (const name of sdkByGroup.keys()) {
      const pages = sdkByGroup.get(name) ?? []
      initial[name] = pages.some((p) => p.href === pathname)
    }
    if (Object.keys(initial).length > 0 && Object.values(initial).every((v) => !v)) {
      for (const k of Object.keys(initial)) initial[k] = true
    }
    return initial
  })

  const toggleSdk = React.useCallback((name: string) => {
    setOpenSdks((prev) => ({ ...prev, [name]: !prev[name] }))
  }, [])

  const renderLink = (
    href: string,
    label: string,
    Icon: React.ComponentType<{ className?: string }>,
    isActive: boolean,
    isSub = false
  ) => (
    <li key={href}>
      <Link
        href={href}
        className={cn(
          isSub ? subNavLinkClass : navLinkClass,
          isActive
            ? "bg-primary/10 font-medium text-primary "
            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
        )}
      >
        {!isSub && <Icon className="size-4 shrink-0" />}
        {label}
      </Link>
    </li>
  )

  return (
    <>
      <nav className="space-y-6 md:max-h-[calc(100svh-var(--landing-nav-height)-2.7rem)] md:overflow-auto no-scrollbar">
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Docs
          </p>
          <ul className="space-y-0.5">
            {docsLinks.map((meta) => {
              const isActive = pathname === meta.href || (meta.href === "/docs" && pathname === "/docs")
              return renderLink(meta.href, meta.title, getIconForMeta(meta.icon), isActive)
            })}
          </ul>
        </div>
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            SDK
          </p>
          <ul className="space-y-0.5">
            {Array.from(sdkByGroup.entries()).map(([sdkName, pages]) => {
              const Icon = getIconForMeta(sdkName)
              const sdkLabel = SDK_LABELS[sdkName] ?? sdkName.charAt(0).toUpperCase() + sdkName.slice(1)
              const isOpen = openSdks[sdkName] ?? true
              return (
                <li key={sdkName} className="relative">
                  <div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      decorations={false}
                      onClick={() => toggleSdk(sdkName)}
                      className="w-full justify-start gap-2 py-1.5 pr-2 text-xs text-muted-foreground hover:bg-muted/50 hover:text-foreground aria-expanded:bg-transparent aria-expanded:text-muted-foreground"
                      aria-expanded={isOpen}
                    >
                      <span className="flex size-4 shrink-0 items-center justify-center">
                        {isOpen ? (
                          <ChevronDownIcon className="size-3.5" />
                        ) : (
                          <ChevronRightIcon className="size-3.5" />
                        )}
                      </span>
                      <Icon className="size-4 shrink-0" />
                      {sdkLabel}
                    </Button>
                    {isOpen && (
                      <ul className="mt-0.5 space-y-0.5 border-l-2 border-border pl-2 ml-4">
                        {pages.map(({ href, title }) => {
                          const isActive = pathname === href
                          return (
                            <li key={href}>
                              <Link
                                href={href}
                                className={cn(
                                  subNavLinkClass,
                                  isActive
                                    ? "border-l-primary bg-primary/10 font-medium text-primary"
                                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                )}
                              >
                                {title}
                              </Link>
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
        {apiTesterLinks.length > 0 && (
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              API Explorer
            </p>
            <ul className="space-y-0.5">
              {apiTesterLinks.map((meta) => {
                const isActive = pathname === meta.href
                return renderLink(meta.href, meta.title, getIconForMeta(meta.icon), isActive)
              })}
            </ul>
          </div>
        )}
      </nav>
    </>
  )
}
