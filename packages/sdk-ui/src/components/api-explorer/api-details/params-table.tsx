import * as React from "react";
import { format, parseISO } from "date-fns";
import {
  CalendarIcon,
  CornerDownLeftIcon,
  FileIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { JsonHighlightTextarea } from "./json-highlight";
import { canonicalParamRowType, type ParamRow } from "./types";
import Decorations from "@/components/ui/decorations";

const ROW_TYPES = [
  "string",
  "number",
  "boolean",
  "date",
  "datetime",
  "file",
] as const;

const HOUR_12_OPTIONS = [
  "12",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
];
const MINUTE_OPTIONS = Array.from({ length: 60 }, (_, i) =>
  i.toString().padStart(2, "0"),
);
const AM_PM_OPTIONS = ["AM", "PM"] as const;
/** Max height for time dropdowns so they don’t overflow (Radix can override Tailwind, so use style). */
const TIME_SELECT_MAX_HEIGHT_STYLE = { maxHeight: "12rem" };

function formatTime12h(hhmm: string): string {
  const [h, m] = hhmm.split(":");
  const hNum = parseInt(h ?? "0", 10);
  const h12 = hNum === 0 ? 12 : hNum > 12 ? hNum - 12 : hNum;
  const ampm = hNum < 12 ? "AM" : "PM";
  return `${h12}:${m ?? "00"} ${ampm}`;
}

/** Convert 24h "HH:mm" to 12h hour + AM/PM for dropdowns. */
function timePartTo12h(hhmm: string): {
  hour12: string;
  minute: string;
  ampm: "AM" | "PM";
} {
  const [h, m] = hhmm.split(":");
  const hour24 = parseInt(h ?? "0", 10);
  const hour12 =
    hour24 === 0 ? "12" : hour24 > 12 ? String(hour24 - 12) : String(hour24);
  const ampm = hour24 < 12 ? "AM" : "PM";
  return { hour12, minute: (m ?? "00").padStart(2, "0"), ampm };
}

/** Convert 12h hour + AM/PM + minute to 24h "HH:mm". */
function to24h(hour12: string, minute: string, ampm: string): string {
  const h = parseInt(hour12, 10);
  const hour24 =
    hour12 === "12" ? (ampm === "AM" ? 0 : 12) : ampm === "PM" ? h + 12 : h;
  return `${hour24.toString().padStart(2, "0")}:${minute.padStart(2, "0")}`;
}

interface ParamsTableProps {
  rows: ParamRow[];
  setRows: React.Dispatch<React.SetStateAction<ParamRow[]>>;
  allowAddMore?: boolean;
  showTypeColumn?: boolean;
  /** If true, type can be changed (e.g. to File for body). */
  allowTypeChange?: boolean;
  /** Keys of rows that should be shown with error styling (e.g. required but empty). */
  errorKeys?: string[];
  /** Keys of rows that are required (show required indicator in Key column). */
  requiredKeys?: string[];
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
    [errorKeys],
  );
  const requiredKeySet = React.useMemo(
    () => new Set(requiredKeys.map((k) => k.trim())),
    [requiredKeys],
  );
  /** For array-type rows: current input for the next item to add. */
  const [arrayInputByRow, setArrayInputByRow] = React.useState<
    Record<string, string>
  >({});

  const updateRow = (id: string, updates: Partial<ParamRow>) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r)),
    );
  };

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
    ]);
  };

  const maxFiles = (row: ParamRow) => row.fileMaxFiles ?? 1;
  const accept = (row: ParamRow) => row.fileAccept;

  const handleFileChange = (
    id: string,
    e: React.ChangeEvent<HTMLInputElement>,
    row: ParamRow,
  ) => {
    const nextFiles = Array.from(e.target.files ?? []);
    const max = maxFiles(row);
    if (max <= 1) {
      const file = nextFiles[0] ?? null;
      updateRow(id, { file, files: undefined, value: file ? file.name : "" });
    } else {
      const current = row.files ?? [];
      const merged = [...current, ...nextFiles].slice(0, max);
      updateRow(id, {
        file: undefined,
        files: merged,
        value: merged.length ? merged.map((f) => f.name).join(", ") : "",
      });
    }
    e.target.value = "";
  };

  const removeFileAt = (rowId: string, index: number) => {
    const row = rows.find((r) => r.id === rowId);
    if (!row) return;
    const max = maxFiles(row);
    if (max <= 1) {
      updateRow(rowId, { file: null, value: "" });
    } else {
      const next = (row.files ?? []).filter((_, i) => i !== index);
      updateRow(rowId, {
        files: next,
        value: next.length ? next.map((f) => f.name).join(", ") : "",
      });
    }
  };

  const removeRow = (id: string) => {
    setRows((prev) =>
      prev.length > 1 ? prev.filter((r) => r.id !== id) : prev,
    );
  };

  const parseArrayValue = (value: string): string[] => {
    if (value.trim() === "") return [];
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.map(String) : [value];
    } catch {
      return [];
    }
  };

  const addArrayItem = (rowId: string, newItem: string) => {
    const row = rows.find((r) => r.id === rowId);
    if (!row) return;
    const arr = parseArrayValue(row.value);
    arr.push(newItem.trim());
    updateRow(rowId, { value: JSON.stringify(arr) });
    setArrayInputByRow((prev) => ({ ...prev, [rowId]: "" }));
  };

  const removeArrayItem = (rowId: string, index: number) => {
    const row = rows.find((r) => r.id === rowId);
    if (!row) return;
    const arr = parseArrayValue(row.value);
    arr.splice(index, 1);
    updateRow(rowId, { value: JSON.stringify(arr) });
  };

  const isInvalidObjectJson = (value: string): boolean => {
    if (value.trim() === "") return false;
    try {
      const parsed = JSON.parse(value);
      return typeof parsed !== "object" || parsed === null;
    } catch {
      return true;
    }
  };

  /** File type is only allowed in Body tab (allowTypeChange). In Params/Headers, hide File rows. */
  const visibleRows = allowTypeChange
    ? rows
    : rows.filter((r) => canonicalParamRowType(r.type) !== "File");
  const allChecked =
    visibleRows.length > 0 && visibleRows.every((r) => r.enabled);
  const someChecked = visibleRows.some((r) => r.enabled);

  const handleHeaderCheckboxChange = (checked: boolean | "indeterminate") => {
    const newEnabled = checked === true;
    setRows((prev) => prev.map((r) => ({ ...r, enabled: newEnabled })));
  };

  const headerChecked =
    visibleRows.length === 0
      ? false
      : allChecked
        ? true
        : someChecked
          ? ("indeterminate" as const)
          : false;

  if (visibleRows.length === 0 && !allowAddMore) {
    return (
      <div className="rounded-md border border-border border-dashed px-4 py-6 text-center text-muted-foreground text-xs">
        No params defined
      </div>
    );
  }

  return (
    <div className="overflow-hidden p-px pr-[2px] pb-[2px]">
      <div className="relative border border-border">
        <Decorations />
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
                <th className="w-[120px] px-3 py-2 text-left font-medium">
                  Type
                </th>
              )}
              {allowAddMore && <th className="w-10 px-2 py-2" />}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => {
              const rowType = canonicalParamRowType(row.type);
              const hasError = errorKeySet.has(row.key.trim());
              const isRequired = requiredKeySet.has(row.key.trim());
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
                        onChange={(e) =>
                          updateRow(row.id, { key: e.target.value })
                        }
                        placeholder="Key"
                        className="h-7 border-0 bg-transparent font-mono text-xs focus-visible:ring-1"
                        readOnly={!allowAddMore}
                      />
                      {isRequired && (
                        <span
                          className="text-destructive shrink-0 font-mono text-xs"
                          title="Required"
                        >
                          *
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-1.5">
                    {rowType.toLowerCase() === "file" ? (
                      (() => {
                        const fileList =
                          maxFiles(row) > 1
                            ? (row.files ?? [])
                            : row.file
                              ? [row.file]
                              : [];
                        const hasFiles = fileList.length > 0;
                        const canAddMore =
                          maxFiles(row) > 1
                            ? fileList.length < maxFiles(row)
                            : true;

                        if (!hasFiles) {
                          return (
                            <label className="flex cursor-pointer items-center gap-2">
                              <input
                                type="file"
                                multiple={maxFiles(row) > 1}
                                accept={accept(row)}
                                onChange={(e) =>
                                  handleFileChange(row.id, e, row)
                                }
                                className="text-muted-foreground w-full max-w-[220px] cursor-pointer text-xs file:mr-2 file:cursor-pointer file:rounded file:border-0 file:bg-muted file:px-2 file:py-1 file:text-xs file:text-foreground"
                              />
                              <span className="text-muted-foreground shrink-0 text-xs">
                                {accept(row)
                                  ? `Choose file (${accept(row)})`
                                  : "Choose file"}
                              </span>
                            </label>
                          );
                        }

                        return (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-7 gap-1.5 font-mono text-xs"
                              >
                                <FileIcon className="size-3.5" />
                                {fileList.length === 1
                                  ? "1 file"
                                  : `${fileList.length} files`}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              align="start"
                              className="w-72 overflow-hidden p-0 border-4"
                            >
                              <div className="flex flex-col">
                                <div className="max-h-56 overflow-auto p-1">
                                  <div className="flex flex-col gap-0.5">
                                    {fileList.map((file, idx) => (
                                      <div
                                        key={`${row.id}-${idx}-${file.name}`}
                                        className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs/relaxed hover:bg-muted"
                                      >
                                        <FileIcon className="size-3.5 shrink-0 text-muted-foreground" />
                                        <span
                                          className="min-w-0 flex-1 truncate font-mono"
                                          title={file.name}
                                        >
                                          {file.name}
                                        </span>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon"
                                          className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                                          onClick={() =>
                                            removeFileAt(row.id, idx)
                                          }
                                          aria-label="Remove file"
                                        >
                                          <Trash2Icon className="size-3.5" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {canAddMore && (
                                  <label className="flex cursor-pointer items-center gap-2 border-t border-border bg-border px-3 py-2.5 text-xs text-muted-foreground">
                                    <input
                                      type="file"
                                      multiple={maxFiles(row) > 1}
                                      accept={accept(row)}
                                      onChange={(e) =>
                                        handleFileChange(row.id, e, row)
                                      }
                                      className="sr-only"
                                    />
                                    <CornerDownLeftIcon className="size-3.5 shrink-0" />
                                    <span>
                                      Add file
                                      {maxFiles(row) > 1
                                        ? ` (${fileList.length}/${maxFiles(row)})`
                                        : ""}
                                    </span>
                                  </label>
                                )}
                              </div>
                            </PopoverContent>
                          </Popover>
                        );
                      })()
                    ) : rowType.toLowerCase() === "array" ? (
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
                              setArrayInputByRow((prev) => ({
                                ...prev,
                                [row.id]: e.target.value,
                              }))
                            }
                            placeholder="Add value"
                            className="h-7 flex-1 min-w-0 border border-border font-mono text-xs"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                const v = (
                                  arrayInputByRow[row.id] ?? ""
                                ).trim();
                                if (v) addArrayItem(row.id, v);
                              }
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-7 w-7 shrink-0"
                            onClick={() => {
                              const v = (arrayInputByRow[row.id] ?? "").trim();
                              if (v) addArrayItem(row.id, v);
                            }}
                            aria-label="Add value"
                          >
                            <PlusIcon className="size-3.5" />
                          </Button>
                        </div>
                      </div>
                    ) : rowType.toLowerCase() === "date" ? (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 w-full justify-start font-mono text-xs font-normal"
                          >
                            <CalendarIcon className="mr-2 size-3.5" />
                            {row.value
                              ? format(
                                  (() => {
                                    try {
                                      return parseISO(row.value);
                                    } catch {
                                      return new Date();
                                    }
                                  })(),
                                  "PPP",
                                )
                              : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent align="start" className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={
                              row.value
                                ? (() => {
                                    try {
                                      const d = parseISO(row.value);
                                      return isNaN(d.getTime()) ? undefined : d;
                                    } catch {
                                      return undefined;
                                    }
                                  })()
                                : undefined
                            }
                            onSelect={(d) => {
                              if (d)
                                updateRow(row.id, {
                                  value: format(d, "yyyy-MM-dd"),
                                });
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    ) : rowType.toLowerCase() === "datetime" ? (
                      <div className="flex flex-col gap-1.5">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 w-full justify-start font-mono text-xs font-normal"
                            >
                              <CalendarIcon className="mr-2 size-3.5" />
                              {row.value
                                ? (() => {
                                    const [datePart, timePart] =
                                      row.value.split("T");
                                    try {
                                      const d = datePart
                                        ? parseISO(datePart)
                                        : null;
                                      const dateStr =
                                        d && !isNaN(d.getTime())
                                          ? format(d, "PPP")
                                          : "";
                                      const timeStr = timePart
                                        ? formatTime12h(timePart.slice(0, 5))
                                        : "";
                                      return timeStr
                                        ? `${dateStr} ${timeStr}`
                                        : dateStr || "Pick date & time";
                                    } catch {
                                      return "Pick date & time";
                                    }
                                  })()
                                : "Pick date & time"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent align="start" className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={
                                row.value?.includes("T")
                                  ? (() => {
                                      const datePart = row.value.split("T")[0];
                                      if (!datePart) return undefined;
                                      try {
                                        const d = parseISO(datePart);
                                        return isNaN(d.getTime())
                                          ? undefined
                                          : d;
                                      } catch {
                                        return undefined;
                                      }
                                    })()
                                  : row.value
                                    ? (() => {
                                        try {
                                          const d = parseISO(row.value);
                                          return isNaN(d.getTime())
                                            ? undefined
                                            : d;
                                        } catch {
                                          return undefined;
                                        }
                                      })()
                                    : undefined
                              }
                              onSelect={(d) => {
                                if (d) {
                                  const timePart = row.value?.includes("T")
                                    ? (row.value.split("T")[1]?.slice(0, 5) ??
                                      "00:00")
                                    : "00:00";
                                  updateRow(row.id, {
                                    value: `${format(d, "yyyy-MM-dd")}T${timePart}`,
                                  });
                                }
                              }}
                              captionLayout="dropdown"
                            />
                            <div className="border-t border-border p-2">
                              <div className="text-muted-foreground flex items-center gap-2 text-xs">
                                <span className="shrink-0">Time</span>
                                {(() => {
                                  const timePart = row.value?.includes("T")
                                    ? row.value.split("T")[1]?.slice(0, 5)
                                    : "00:00";
                                  const { hour12, minute, ampm } =
                                    timePartTo12h(timePart);
                                  const datePart = row.value?.includes("T")
                                    ? row.value.split("T")[0]
                                    : format(new Date(), "yyyy-MM-dd");
                                  const setTime = (
                                    h: string,
                                    m: string,
                                    a: string,
                                  ) =>
                                    updateRow(row.id, {
                                      value: `${datePart}T${to24h(h, m, a)}`,
                                    });
                                  return (
                                    <div className="flex items-center gap-1.5">
                                      <Select
                                        value={hour12}
                                        onValueChange={(h) =>
                                          setTime(h, minute, ampm)
                                        }
                                      >
                                        <SelectTrigger
                                          size="sm"
                                          className="h-7 w-12 font-mono text-xs"
                                        >
                                          <SelectValue placeholder="Hr" />
                                        </SelectTrigger>
                                        <SelectContent
                                          position="popper"
                                          side="bottom"
                                          align="start"
                                          sideOffset={4}
                                          className="overflow-y-auto"
                                          style={TIME_SELECT_MAX_HEIGHT_STYLE}
                                        >
                                          {HOUR_12_OPTIONS.map((h) => (
                                            <SelectItem
                                              key={h}
                                              value={h}
                                              className="font-mono text-xs"
                                            >
                                              {h}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <span className="text-muted-foreground font-mono">
                                        :
                                      </span>
                                      <Select
                                        value={minute}
                                        onValueChange={(m) =>
                                          setTime(hour12, m, ampm)
                                        }
                                      >
                                        <SelectTrigger
                                          size="sm"
                                          className="h-7 w-14 font-mono text-xs"
                                        >
                                          <SelectValue placeholder="mm" />
                                        </SelectTrigger>
                                        <SelectContent
                                          position="popper"
                                          side="bottom"
                                          align="start"
                                          sideOffset={4}
                                          className="overflow-y-auto"
                                          style={TIME_SELECT_MAX_HEIGHT_STYLE}
                                        >
                                          {MINUTE_OPTIONS.map((m) => (
                                            <SelectItem
                                              key={m}
                                              value={m}
                                              className="font-mono text-xs"
                                            >
                                              {m}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <Select
                                        value={ampm}
                                        onValueChange={(a) =>
                                          setTime(hour12, minute, a)
                                        }
                                      >
                                        <SelectTrigger
                                          size="sm"
                                          className="h-7 w-14 font-mono text-xs"
                                        >
                                          <SelectValue placeholder="AM/PM" />
                                        </SelectTrigger>
                                        <SelectContent
                                          position="popper"
                                          side="bottom"
                                          align="start"
                                          sideOffset={4}
                                          style={TIME_SELECT_MAX_HEIGHT_STYLE}
                                        >
                                          {AM_PM_OPTIONS.map((a) => (
                                            <SelectItem
                                              key={a}
                                              value={a}
                                              className="font-mono text-xs"
                                            >
                                              {a}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  );
                                })()}
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    ) : rowType.toLowerCase() === "object" ? (
                      <JsonHighlightTextarea
                        value={row.value}
                        onChange={(e) =>
                          updateRow(row.id, { value: e.target.value })
                        }
                        placeholder='{"key": "value"}'
                        invalid={isInvalidObjectJson(row.value)}
                        rows={3}
                      />
                    ) : (
                      <Input
                        value={row.value}
                        onChange={(e) =>
                          updateRow(row.id, { value: e.target.value })
                        }
                        placeholder="Value"
                        className="h-7 border-0 bg-transparent font-mono text-xs focus-visible:ring-1"
                      />
                    )}
                  </td>
                  {showTypeColumn && (
                    <td className="px-3 py-1.5">
                      {allowTypeChange ? (
                        <select
                          value={rowType}
                          onChange={(e) =>
                            updateRow(row.id, {
                              type: e.target.value,
                              ...(e.target.value !== "file"
                                ? { file: undefined, files: undefined }
                                : {}),
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
                          {rowType}
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
              );
            })}
          </tbody>
        </table>
        {allowAddMore && (
          <div className="flex items-center gap-2 border-t border-border bg-muted/30 px-3 py-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={addRow}
            >
              <PlusIcon className="size-3.5" />
              Add More
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
