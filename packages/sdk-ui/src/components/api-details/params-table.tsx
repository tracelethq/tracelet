import * as React from "react"
import { PlusIcon, Trash2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { JsonHighlightTextarea } from "./json-highlight"
import type { ParamRow } from "./types"

const ROW_TYPES = ["String", "Number", "Boolean", "File"] as const

interface ParamsTableProps {
  rows: ParamRow[]
  setRows: React.Dispatch<React.SetStateAction<ParamRow[]>>
  allowAddMore?: boolean
  showTypeColumn?: boolean
  /** If true, type can be changed (e.g. to File for body). */
  allowTypeChange?: boolean
  /** Keys of rows that should be shown with error styling (e.g. required but empty). */
  errorKeys?: string[]
  /** Keys of rows that are required (show required indicator in Key column). */
  requiredKeys?: string[]
}

export function ParamsTable({
  rows,
  setRows,
  allowAddMore = false,
  showTypeColumn = true,
  allowTypeChange = false,
  errorKeys = [],
  requiredKeys = [],
}: ParamsTableProps) {
  const errorKeySet = React.useMemo(
    () => new Set(errorKeys.map((k) => k.trim())),
    [errorKeys]
  )
  const requiredKeySet = React.useMemo(
    () => new Set(requiredKeys.map((k) => k.trim())),
    [requiredKeys]
  )
  /** For array-type rows: current input for the next item to add. */
  const [arrayInputByRow, setArrayInputByRow] = React.useState<Record<string, string>>({})

  const updateRow = (id: string, updates: Partial<ParamRow>) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    )
  }

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        key: "",
        value: "",
        type: "String",
        enabled: true,
      },
    ])
  }

  const handleFileChange = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    updateRow(id, { file, value: file ? file.name : "" })
  }

  const removeRow = (id: string) => {
    setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev))
  }

  const parseArrayValue = (value: string): string[] => {
    if (value.trim() === "") return []
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? parsed.map(String) : [value]
    } catch {
      return []
    }
  }

  const addArrayItem = (rowId: string, newItem: string) => {
    const row = rows.find((r) => r.id === rowId)
    if (!row) return
    const arr = parseArrayValue(row.value)
    arr.push(newItem.trim())
    updateRow(rowId, { value: JSON.stringify(arr) })
    setArrayInputByRow((prev) => ({ ...prev, [rowId]: "" }))
  }

  const removeArrayItem = (rowId: string, index: number) => {
    const row = rows.find((r) => r.id === rowId)
    if (!row) return
    const arr = parseArrayValue(row.value)
    arr.splice(index, 1)
    updateRow(rowId, { value: JSON.stringify(arr) })
  }

  const isInvalidObjectJson = (value: string): boolean => {
    if (value.trim() === "") return false
    try {
      const parsed = JSON.parse(value)
      return typeof parsed !== "object" || parsed === null
    } catch {
      return true
    }
  }

  /** File type is only allowed in Body tab (allowTypeChange). In Params/Headers, hide File rows. */
  const visibleRows = allowTypeChange ? rows : rows.filter((r) => r.type !== "File")
  const allChecked = visibleRows.length > 0 && visibleRows.every((r) => r.enabled)
  const someChecked = visibleRows.some((r) => r.enabled)

  const handleHeaderCheckboxChange = (checked: boolean | "indeterminate") => {
    const newEnabled = checked === true
    setRows((prev) => prev.map((r) => ({ ...r, enabled: newEnabled })))
  }

  const headerChecked =
    visibleRows.length === 0
      ? false
      : allChecked
        ? true
        : someChecked
          ? ("indeterminate" as const)
          : false

  if (visibleRows.length === 0 && !allowAddMore) {
    return (
      <div className="rounded-md border border-border border-dashed px-4 py-6 text-center text-muted-foreground text-xs">
        No params defined
      </div>
    )
  }

  return (
    <div className="rounded-md border border-border overflow-hidden">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="w-8 px-3 py-2 text-left font-medium">
              <Checkbox
                checked={headerChecked}
                onCheckedChange={handleHeaderCheckboxChange}
                aria-label="Toggle all rows"
              />
            </th>
            <th className="w-[25%] px-3 py-2 text-left font-medium">Key</th>
            <th className="px-3 py-2 text-left font-medium">Value</th>
            {showTypeColumn && (
              <th className="w-[120px] px-3 py-2 text-left font-medium">Type</th>
            )}
            {allowAddMore && <th className="w-10 px-2 py-2" />}
          </tr>
        </thead>
        <tbody>
          {visibleRows.map((row) => {
            const hasError = errorKeySet.has(row.key.trim())
            const isRequired = requiredKeySet.has(row.key.trim())
            return (
            <tr
              key={row.id}
              className={`border-b border-border last:border-b-0 ${hasError ? "bg-destructive/10 border-l-4 border-l-destructive" : ""}`}
            >
              <td className="px-3 py-1.5">
                <Checkbox
                  checked={row.enabled}
                  onCheckedChange={(checked) =>
                    updateRow(row.id, { enabled: checked === true })
                  }
                  aria-label={`Toggle ${row.key || "row"}`}
                />
              </td>
              <td className="px-3 py-1.5">
                <div className="flex items-center gap-1">
                  <Input
                    value={row.key}
                    onChange={(e) => updateRow(row.id, { key: e.target.value })}
                    placeholder="Key"
                    className="h-7 border-0 bg-transparent font-mono text-xs focus-visible:ring-1"
                    readOnly={!allowAddMore}
                  />
                  {isRequired && (
                    <span className="text-destructive shrink-0 font-mono text-xs" title="Required">
                      *
                    </span>
                  )}
                </div>
              </td>
              <td className="px-3 py-1.5">
                {row.type === "file" ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      onChange={(e) => handleFileChange(row.id, e)}
                      className="text-muted-foreground h-7 max-w-[180px] cursor-pointer text-xs file:mr-2 file:cursor-pointer file:rounded file:border-0 file:bg-muted file:px-2 file:py-1 file:text-xs file:text-foreground"
                    />
                    {row.value && (
                      <span className="truncate font-mono text-xs" title={row.value}>
                        {row.value}
                      </span>
                    )}
                  </div>
                ) : row.type?.toLowerCase() === "array" ? (
                  <div className="flex flex-col gap-1.5">
                    <div className="flex flex-wrap gap-1">
                      {parseArrayValue(row.value).map((item, idx) => (
                        <span
                          key={`${row.id}-${idx}`}
                          className="bg-muted text-foreground inline-flex items-center gap-1 rounded px-2 py-0.5 font-mono text-xs"
                        >
                          {item}
                          <button
                            type="button"
                            onClick={() => removeArrayItem(row.id, idx)}
                            className="text-muted-foreground hover:text-destructive"
                            aria-label="Remove"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-1">
                      <Input
                        value={arrayInputByRow[row.id] ?? ""}
                        onChange={(e) =>
                          setArrayInputByRow((prev) => ({ ...prev, [row.id]: e.target.value }))
                        }
                        placeholder="Add value"
                        className="h-7 flex-1 min-w-0 border border-border font-mono text-xs"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            const v = (arrayInputByRow[row.id] ?? "").trim()
                            if (v) addArrayItem(row.id, v)
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-7 w-7 shrink-0"
                        onClick={() => {
                          const v = (arrayInputByRow[row.id] ?? "").trim()
                          if (v) addArrayItem(row.id, v)
                        }}
                        aria-label="Add value"
                      >
                        <PlusIcon className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                ) : row.type?.toLowerCase() === "object" ? (
                  <JsonHighlightTextarea
                    value={row.value}
                    onChange={(e) => updateRow(row.id, { value: e.target.value })}
                    placeholder='{"key": "value"}'
                    invalid={isInvalidObjectJson(row.value)}
                    rows={3}
                  />
                ) : (
                  <Input
                    value={row.value}
                    onChange={(e) => updateRow(row.id, { value: e.target.value })}
                    placeholder="Value"
                    className="h-7 border-0 bg-transparent font-mono text-xs focus-visible:ring-1"
                  />
                )}
              </td>
              {showTypeColumn && (
                <td className="px-3 py-1.5">
                  {allowTypeChange ? (
                    <select
                      value={row.type}
                      onChange={(e) =>
                        updateRow(row.id, {
                          type: e.target.value,
                          ...(e.target.value !== "File" ? { file: undefined } : {}),
                        })
                      }
                      className="bg-transparent font-mono text-xs outline-none focus:ring-1 focus:ring-ring rounded border border-transparent"
                    >
                      {ROW_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-muted-foreground font-mono text-xs">
                      {row.type}
                    </span>
                  )}
                </td>
              )}
              {allowAddMore && (
                <td className="px-2 py-1.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-6 text-muted-foreground hover:text-destructive"
                    onClick={() => removeRow(row.id)}
                  >
                    <Trash2Icon className="size-3.5" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </td>
              )}
            </tr>
            )
          })}
        </tbody>
      </table>
      {allowAddMore && (
        <div className="flex items-center gap-2 border-t border-border bg-muted/30 px-3 py-2">
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={addRow}>
            <PlusIcon className="size-3.5" />
            Add More
          </Button>
        </div>
      )}
    </div>
  )
}
