"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
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
        <Button
          type="button"
          variant={value === "express" ? "default" : "ghost"}
          size="sm"
          onClick={() => onChange("express")}
          className={value === "express" ? "" : "text-muted-foreground hover:bg-muted hover:text-foreground"}
        >
          Express
        </Button>
        <Button
          type="button"
          variant={value === "core" ? "default" : "ghost"}
          size="sm"
          onClick={() => onChange("core")}
          className={value === "core" ? "" : "text-muted-foreground hover:bg-muted hover:text-foreground"}
        >
          Core only
        </Button>
      </div>
      <span className="text-xs text-muted-foreground">
        {value === "express"
          ? "Logging + API docs UI (recommended)"
          : "Core SDK only (no Express)"}
      </span>
    </div>
  )
}
