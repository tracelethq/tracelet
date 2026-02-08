"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type SdkChoice = "express" | "core"

const STORAGE_KEY = "tracelet-docs-sdk"

export function getStoredSdk(): SdkChoice {
  if (typeof window === "undefined") return "express"
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (stored === "core" || stored === "express") return stored
  return "express"
}

export function useSdkChoice(): [SdkChoice, (sdk: SdkChoice) => void] {
  const [sdk, setSdk] = React.useState<SdkChoice>("express")

  React.useEffect(() => {
    setSdk(getStoredSdk())
  }, [])

  const setAndStore = React.useCallback((next: SdkChoice) => {
    setSdk(next)
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, next)
    }
  }, [])

  return [sdk, setAndStore]
}

type SdkSelectorProps = {
  value: SdkChoice
  onChange: (sdk: SdkChoice) => void
  className?: string
}

export function SdkSelector({ value, onChange, className }: SdkSelectorProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2",
        className
      )}
    >
      <span className="text-xs font-medium text-muted-foreground">
        Setup for:
      </span>
      <div className="flex gap-0.5">
        <button
          type="button"
          onClick={() => onChange("express")}
          className={cn(
            "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
            value === "express"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          Express
        </button>
        <button
          type="button"
          onClick={() => onChange("core")}
          className={cn(
            "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
            value === "core"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          Core only
        </button>
      </div>
      <span className="text-xs text-muted-foreground">
        {value === "express"
          ? "Logging + API docs UI (recommended)"
          : "Core SDK only (no Express)"}
      </span>
    </div>
  )
}
