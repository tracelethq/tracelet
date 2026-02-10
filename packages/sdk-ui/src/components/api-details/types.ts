import type { RouteProperty } from "@/types/route"

export interface ParamRow {
  id: string
  key: string
  value: string
  type: string
  enabled: boolean
  /** For type "File": the selected file(s). Not persisted when saving per-route state. */
  file?: File | null
  /** For type "File" when multiple allowed: selected files (takes precedence over file if length > 0). */
  files?: File[]
  /** For type "File": accepted types (e.g. "image/*", ".pdf"). From route request property. */
  fileAccept?: string
  /** For type "File": max number of files (default 1). From route request property. */
  fileMaxFiles?: number
}

/**
 * Normalize incoming schema/meta "type" strings to the canonical UI labels used by `ParamsTable`.
 * This keeps the UI working even if route meta uses variants like "date-time" or lower-cased primitives.
 */
export function canonicalParamRowType(type: string | undefined): string {
  const raw = typeof type === "string" ? type.trim() : ""
  const t = raw.toLowerCase()

  // Datelike
  if (t === "date") return "Date"
  if (t === "datetime" || t === "date-time" || t === "date_time") return "DateTime"

  // Common primitives
  if (t === "string") return "String"
  if (t === "boolean" || t === "bool") return "Boolean"
  if (t === "number" || t === "integer" || t === "int" || t === "float" || t === "double") return "Number"

  // File
  if (t === "file") return "File"

  // Keep unknowns as-is (fallback to String for empty)
  return raw || "String"
}

/** OpenAPI-style schema property (object shape) */
type SchemaProperty = {
  type?: string
  description?: string
  enum?: readonly string[]
  required?: boolean
  accept?: string
  maxFiles?: number
}

/**
 * Normalize request body to a RouteProperty[] so both array and object shapes work.
 * Handles: RouteProperty[], or { properties: Record<string, { type?, description?, required? }> }.
 */
export function normalizeRequestBody(
  request:
    | RouteProperty[]
    | { properties?: Record<string, SchemaProperty> }
    | undefined
): RouteProperty[] {
  if (!request) return []
  if (Array.isArray(request) && request.length > 0) return request
  const props = request && typeof request === "object" && "properties" in request && request.properties
  if (!props || typeof props !== "object") return []
  return Object.entries(props).map(([name, s]) => ({
    name,
    type: (s && typeof s === "object" && typeof s.type === "string" ? s.type : "string") as string,
    desc: s && typeof s === "object" && typeof s.description === "string" ? s.description : undefined,
    enum: s && typeof s === "object" && Array.isArray(s.enum) ? s.enum : undefined,
    required: s && typeof s === "object" && s.required === true,
    accept: s && typeof s === "object" && typeof s.accept === "string" ? s.accept : undefined,
    maxFiles: s && typeof s === "object" && typeof s.maxFiles === "number" ? s.maxFiles : undefined,
  }))
}

/**
 * Extract path param names from a route path (e.g. "/users/:id/posts/:postId" → ["id", "postId"]).
 * Use when meta does not provide params so the Params tab can still show path placeholders.
 */
export function extractPathParamNames(path: string): string[] {
  if (!path || typeof path !== "string") return []
  const matches = path.match(/:[^/]+/g)
  return matches ? [...new Set(matches.map((s) => s.slice(1)))] : []
}

/**
 * Normalize route.params (and optionally route.query) to RouteProperty[].
 * Handles: RouteProperty[], or array of { properties: RouteProperty[] } (legacy shape).
 */
export function normalizeParams(
  params: RouteProperty[] | Array<{ name?: string; type?: string; properties?: RouteProperty[] }> | undefined
): RouteProperty[] {
  if (!params || !Array.isArray(params) || params.length === 0) return []
  const first = params[0]
  if (first && typeof first === "object" && Array.isArray((first as { properties?: RouteProperty[] }).properties)) {
    return params.flatMap((p) => (p as { properties?: RouteProperty[] }).properties ?? [])
  }
  return params.filter((p): p is RouteProperty => p != null && typeof (p as RouteProperty).name === "string")
}

export function rowsFromProperties(
  properties: RouteProperty[] | undefined
): ParamRow[] {
  if (!properties || properties.length === 0) return []
  return properties.map((p) => {
    const canonicalType =
      p.type === "enum" && p.enum?.length ? "String" : canonicalParamRowType(p.type)
    const isFile = canonicalType.toLowerCase() === "file"
    return {
      id: crypto.randomUUID(),
      key: p.name,
      value: "",
      type: canonicalType,
      enabled: true,
      ...(isFile && {
        fileAccept: p.accept,
        fileMaxFiles: p.maxFiles != null && p.maxFiles >= 1 ? p.maxFiles : 1,
      }),
    }
  })
}

/** Build sample request body as JSON string (keys from request properties, values empty string). */
export function requestBodySampleJson(
  request:
    | RouteProperty[]
    | { properties?: Record<string, SchemaProperty> }
    | undefined
): string {
  const props = normalizeRequestBody(request)
  if (props.length === 0) return "{}"
  const obj: Record<string, string> = {}
  for (const p of props) {
    obj[p.name] = ""
  }
  return JSON.stringify(obj, null, 2)
}

export type ApiTabValue =
  | "details"
  | "params"
  | "body"
  | "headers"
  | "authorization"

/** Shared tab trigger style: primary bottom border when active, no bg or other borders. */
export const TAB_CLASS =
  "max-w-28 truncate rounded-none border-0 border-b-2 border-transparent bg-transparent shadow-none data-[state=active]:border-b-2 data-[state=active]:border-b-primary! data-[state=active]:bg-transparent data-[state=active]:border-x-0 data-[state=active]:border-t-0 data-[state=active]:text-foreground"

/** Visibility condition for a tab. JSON-serializable. */
export type TabVisibility =
  | "always"
  | "whenParams"
  | "whenBody"
  | "whenResponseTypes"
  | "whenResponseTypesOrBody"

export interface TabConfigItem {
  id: ApiTabValue
  label: string
  /** When to show this tab. Default "always". */
  visible?: TabVisibility
}

/** Default tab config. Override via tabsConfig prop for custom order/labels. */
export const DEFAULT_TABS_CONFIG: TabConfigItem[] = [
  { id: "details", label: "Details", visible: "whenResponseTypesOrBody" },
  { id: "params", label: "Params", visible: "whenParams" },
  { id: "body", label: "Body", visible: "whenBody" },
  { id: "headers", label: "Headers", visible: "always" },
  { id: "authorization", label: "Authorization", visible: "always" },
]

export function getVisibleTabs(
  config: TabConfigItem[],
  ctx: {
    hasParams: boolean
    hasBody: boolean
    hasResponseTypes: boolean
  }
): TabConfigItem[] {
  return config.filter((tab) => {
    const v = tab.visible ?? "always"
    if (v === "always") return true
    if (v === "whenParams") return ctx.hasParams
    if (v === "whenBody") return ctx.hasBody
    if (v === "whenResponseTypes") return ctx.hasResponseTypes
    if (v === "whenResponseTypesOrBody") return ctx.hasResponseTypes || ctx.hasBody
    return true
  })
}

export interface AuthState {
  type: "none" | "bearer" | "basic" | "apiKey"
  bearerToken?: string
  username?: string
  password?: string
  apiKeyName?: string
  apiKeyValue?: string
}

export function getRouteTabKey(method: string, path: string): string {
  return `${method}:${path}`
}

export function getFirstAvailableTab(
  hasResponseTypes: boolean,
  hasParams: boolean,
  hasBody: boolean
): ApiTabValue {
  if (hasResponseTypes) return "details"
  if (hasParams) return "params"
  if (hasBody) return "body"
  return "headers"
}

/** First tab from config that is visible in the given context. */
export function getFirstTabFromConfig(
  config: TabConfigItem[],
  ctx: {
    hasParams: boolean
    hasBody: boolean
    hasResponseTypes: boolean
  }
): ApiTabValue {
  const visible = getVisibleTabs(config, ctx)
  return visible[0]?.id ?? "headers"
}
