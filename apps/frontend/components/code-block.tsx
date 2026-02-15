"use client";

import * as React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneDark,
  oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CheckIcon, CopyIcon } from "lucide-react";
import Decorations from "./ui/decorations";

export type CodeBlockTabs = {
  npm?: string;
  yarn?: string;
  pnpm?: string;
};

type CodeBlockProps = {
  /** Single code string (no tabs) */
  code?: string;
  /** Tab label → code. When set, shows npm / yarn / pnpm tabs and ignores code. */
  tabs?: CodeBlockTabs;
  language?: string;
  className?: string;
  /** Terminal-style for landing: borderless, dark background, minimal header */
  variant?: "default" | "terminal";
};

const TAB_ORDER = ["npm", "yarn", "pnpm"] as const;

function getFirstTab(tabs: CodeBlockTabs): keyof CodeBlockTabs {
  for (const key of TAB_ORDER) {
    if (tabs[key]) return key;
  }
  return "npm";
}

export function CodeBlock({
  code: codeProp,
  tabs: tabsProp,
  language = "typescript",
  className,
  variant = "default",
}: CodeBlockProps) {
  const hasTabs = tabsProp && Object.keys(tabsProp).length > 0;
  const tabKeys = hasTabs
    ? (TAB_ORDER.filter((k) => tabsProp![k]) as (keyof CodeBlockTabs)[])
    : [];
  const firstTab = hasTabs ? getFirstTab(tabsProp!) : "npm";
  const [activeTab, setActiveTab] =
    React.useState<keyof CodeBlockTabs>(firstTab);
  const code = hasTabs
    ? (tabsProp![activeTab] ?? "").trim()
    : (codeProp ?? "").trim();

  const { resolvedTheme } = useTheme();
  const style = resolvedTheme === "dark" ? oneDark : oneLight;
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const effectiveStyle = mounted ? style : oneLight;

  const [copied, setCopied] = React.useState(false);
  const copy = React.useCallback(() => {
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      const t = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(t);
    });
  }, [code]);

  if (!hasTabs && !codeProp?.trim()) return null;

  const isTerminal = variant === "terminal";

  return (
    <div
      className={cn(
        "text-card-foreground relative",
        "border border-border bg-card ring-1 ring-foreground/10",
        className,
      )}
    >
      <Decorations />
      <div
        className={cn(
          "flex items-center justify-between px-3 py-2 relative",
          "border-b border-border bg-muted/30",
        )}
      >
        <Decorations className="absolute inset-0 top-0 left-0" />
        {hasTabs && tabKeys.length > 0 ? (
          <div className="flex gap-0.5">
            {tabKeys.map((key) => (
              <Button
                key={key}
                type="button"
                variant={activeTab === key ? "outline" : "ghost"}
                size="sm"
                onClick={() => setActiveTab(key)}
                decorations={false}
                className={
                  cn("rounded-none","hover:text-foreground")
                }
              >
                {key}
              </Button>
            ))}
          </div>
        ) : isTerminal ? (
          <div className="flex gap-1.5">
            <span className="h-2 w-2 rounded-full bg-white/20" />
            <span className="h-2 w-2 rounded-full bg-white/20" />
            <span className="h-2 w-2 rounded-full bg-white/20" />
          </div>
        ) : (
          <span className="text-xs font-medium text-muted-foreground">
            {language}
          </span>
        )}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={copy}
          decorations={false}
          className={cn(
            "gap-1.5",
            isTerminal
              ? "text-white/50 hover:bg-white/10 hover:text-white/80"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
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
        </Button>
      </div>
      <div className="relative">
        <Decorations />
        <SyntaxHighlighter
          language={language}
          style={effectiveStyle}
          customStyle={{
            margin: 0,
            borderRadius: 0,
            fontSize: "0.875rem",
            lineHeight: 1.6,
            padding: "1rem",
            background: isTerminal ? "#0d1117" : "var(--card)",
          }}
          codeTagProps={{
            style: {
              fontFamily: "var(--font-geist-mono, ui-monospace, monospace)",
            },
          }}
          showLineNumbers={false}
          PreTag="div"
          className="overflow-x-auto! border-0 bg-transparent!"
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
