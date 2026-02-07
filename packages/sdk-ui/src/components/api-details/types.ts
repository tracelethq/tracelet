import type { RouteProperty } from "@/types/route"

export interface ParamRow {
  id: string
  key: string
  value: string
  type: string
  enabled: boolean
  /** For type "File": the selected file (not persisted when saving per-route state). */
  file?: File | null
}

export function rowsFromProperties(
  properties: RouteProperty[] | undefined
): ParamRow[] {
  if (!properties || properties.length === 0) return []
  return properties.map((p) => ({
    id: crypto.randomUUID(),
    key: p.name,
    value: "",
    type: p.type === "enum" && p.enum?.length ? "String" : p.type || "String",
    enabled: true,
  }))
}

export type ApiTabValue =
  | "responseTypes"
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

export interface TabConfigItem {
  id: ApiTabValue
  label: string
  /** When to show this tab. Default "always". */
  visible?: TabVisibility
}

/** Default tab config. Override via tabsConfig prop for custom order/labels. */
export const DEFAULT_TABS_CONFIG: TabConfigItem[] = [
  { id: "responseTypes", label: "Response types", visible: "whenResponseTypes" },
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
  if (hasResponseTypes) return "responseTypes"
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
