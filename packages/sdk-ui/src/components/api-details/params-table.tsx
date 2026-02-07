import { PlusIcon, Trash2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { ParamRow } from "./types"

const ROW_TYPES = ["String", "Number", "Boolean", "File"] as const

interface ParamsTableProps {
  rows: ParamRow[]
  setRows: React.Dispatch<React.SetStateAction<ParamRow[]>>
  allowAddMore?: boolean
  showTypeColumn?: boolean
  /** If true, type can be changed (e.g. to File for body). */
  allowTypeChange?: boolean
}

export function ParamsTable({
  rows,
  setRows,
  allowAddMore = false,
  showTypeColumn = true,
  allowTypeChange = false,
}: ParamsTableProps) {
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

  /** File type is only allowed in Body tab (allowTypeChange). In Params/Headers, hide File rows. */
  const visibleRows = allowTypeChange ? rows : rows.filter((r) => r.type !== "File")

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
              <input type="checkbox" className="rounded border-border" defaultChecked />
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
          {visibleRows.map((row) => (
            <tr key={row.id} className="border-b border-border last:border-b-0">
              <td className="px-3 py-1.5">
                <input
                  type="checkbox"
                  checked={row.enabled}
                  onChange={(e) => updateRow(row.id, { enabled: e.target.checked })}
                  className="rounded border-border"
                />
              </td>
              <td className="px-3 py-1.5">
                <Input
                  value={row.key}
                  onChange={(e) => updateRow(row.id, { key: e.target.value })}
                  placeholder="Key"
                  className="h-7 border-0 bg-transparent font-mono text-xs focus-visible:ring-1"
                  readOnly={!allowAddMore}
                />
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
          ))}
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
