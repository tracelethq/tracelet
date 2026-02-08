"use client"

import * as React from "react"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { CheckIcon, CopyIcon } from "lucide-react"

export type CodeBlockTabs = {
  npm?: string
  yarn?: string
  pnpm?: string
}

type CodeBlockProps = {
  /** Single code string (no tabs) */
  code?: string
  /** Tab label → code. When set, shows npm / yarn / pnpm tabs and ignores code. */
  tabs?: CodeBlockTabs
  language?: string
  className?: string
}

const TAB_ORDER = ["npm", "yarn", "pnpm"] as const

function getFirstTab(tabs: CodeBlockTabs): keyof CodeBlockTabs {
  for (const key of TAB_ORDER) {
    if (tabs[key]) return key
  }
  return "npm"
}

export function CodeBlock({
  code: codeProp,
  tabs: tabsProp,
  language = "typescript",
  className,
}: CodeBlockProps) {
  const hasTabs = tabsProp && Object.keys(tabsProp).length > 0
  const tabKeys = hasTabs
    ? (TAB_ORDER.filter((k) => tabsProp![k]) as (keyof CodeBlockTabs)[])
    : []
  const firstTab = hasTabs ? getFirstTab(tabsProp!) : "npm"
  const [activeTab, setActiveTab] = React.useState<keyof CodeBlockTabs>(firstTab)
  const code = hasTabs ? (tabsProp![activeTab] ?? "").trim() : (codeProp ?? "").trim()

  const { resolvedTheme } = useTheme()
  const style = resolvedTheme === "dark" ? oneDark : oneLight
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])
  const effectiveStyle = mounted ? style : oneLight

  const [copied, setCopied] = React.useState(false)
  const copy = React.useCallback(() => {
    if (!code) return
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      const t = setTimeout(() => setCopied(false), 2000)
      return () => clearTimeout(t)
    })
  }, [code])

  if (!hasTabs && !codeProp?.trim()) return null

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-border bg-card text-card-foreground ring-1 ring-foreground/10",
        className
      )}
    >
      <div className="flex items-center justify-between border-b border-border bg-muted/30 px-3 py-2">
        {hasTabs && tabKeys.length > 0 ? (
          <div className="flex gap-0.5">
            {tabKeys.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                  activeTab === key
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {key}
              </button>
            ))}
          </div>
        ) : (
          <span className="text-xs font-medium text-muted-foreground">
            {language}
          </span>
        )}
        <button
          type="button"
          onClick={copy}
          className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label={copied ? "Copied" : "Copy code"}
        >
          {copied ? (
            <>
              <CheckIcon className="size-3.5" />
              Copied
            </>
          ) : (
            <>
              <CopyIcon className="size-3.5" />
              Copy
            </>
          )}
        </button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={effectiveStyle}
        customStyle={{
          margin: 0,
          borderRadius: 0,
          fontSize: "0.875rem",
          lineHeight: 1.6,
          padding: "1rem",
          background: "var(--card)",
        }}
        codeTagProps={{
          style: { fontFamily: "var(--font-geist-mono, ui-monospace, monospace)" },
        }}
        showLineNumbers={false}
        PreTag="div"
        className="overflow-x-auto! border-0 bg-transparent!"
      >
        {code}
      </SyntaxHighlighter>
    </div>
  )
}
