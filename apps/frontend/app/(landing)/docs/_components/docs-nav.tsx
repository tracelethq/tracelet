"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpenIcon, ChevronDownIcon, ChevronRightIcon, Code2Icon, FileTextIcon, BoxIcon, FlaskConicalIcon } from "lucide-react";
import { ExpressIcon } from "@/components/icons/express-icon";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DocMeta } from "@/lib/docs-mdx";

const navLinkClass =
  "flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors w-full text-left";

function isDocsGroup(meta: DocMeta): boolean {
  const first = meta.slug[0]
  return first !== "sdk" && first !== "api-tester"
}

function isApiTesterGroup(meta: DocMeta): boolean {
  return meta.slug[0] === "api-tester"
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

function getIconForSlug(slug: string[]) {
  if (slug.length === 0) return FileTextIcon
  if (slug[0] === "developer") return Code2Icon
  if (slug[0] === "api-tester") return FlaskConicalIcon
  if (slug[0] === "sdk" && slug[1] === "express") return ExpressIcon
  if (slug[0] === "sdk" && slug[1] === "core") return BoxIcon
  return BookOpenIcon
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
    <aside className="min-w-56 w-56 shrink-0 border-r border-border pr-6">
      <nav className="sticky top-20 space-y-6">
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Docs
          </p>
          <ul className="space-y-0.5">
            {docsLinks.map(({ href, title, slug }) => {
              const isActive = pathname === href || (href === "/docs" && pathname === "/docs")
              return renderLink(href, title, getIconForSlug(slug), isActive)
            })}
          </ul>
        </div>
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            SDK
          </p>
          <ul className="space-y-0.5">
            {Array.from(sdkByGroup.entries()).map(([sdkName, pages]) => {
              const Icon = getIconForSlug(["sdk", sdkName])
              const sdkLabel = SDK_LABELS[sdkName] ?? sdkName.charAt(0).toUpperCase() + sdkName.slice(1)
              const isOpen = openSdks[sdkName] ?? true
              return (
                <li key={sdkName} className="relative">
                  <div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
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
                      <ul className="mt-0.5 space-y-0.5 border-l-2 border-border pl-2 ml-2">
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
              API tester
            </p>
            <ul className="space-y-0.5">
              {apiTesterLinks.map(({ href, title, slug }) => {
                const isActive = pathname === href
                return renderLink(href, title, getIconForSlug(slug), isActive)
              })}
            </ul>
          </div>
        )}
      </nav>
    </aside>
  )
}
