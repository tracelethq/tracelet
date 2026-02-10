/** Single request/response property (matches @tracelet/express TraceletProperty) */
export type RouteProperty = {
  name: string
  type: string
  desc?: string
  required?: boolean
  enum?: readonly string[]
  /** When type is "file": accepted file types (e.g. "image/*", ".pdf"). Same as HTML input accept. */
  accept?: string
  /** When type is "file": maximum number of files allowed (default 1). */
  maxFiles?: number
}

/** Response type per status code (matches TraceletResponseProperty) */
export type RouteResponseType = {
  status: number
  description?: string
  properties: RouteProperty[]
}

/** Request body content type for Try-it UI. */
export type RequestContentType = "application/json" | "multipart/form-data"

export type RouteMeta = {
  method: string
  path: string
  description?: string
  /** Preferred request body type. When set, UI uses it; else user can select (remembered per route). */
  requestContentType?: RequestContentType
  request?: RouteProperty[]
  /** Response types per status: status, description, and properties for each */
  responses?: RouteResponseType[]
  /** Query params: list of properties (name, type, desc, required, enum) */
  query?: RouteProperty[]
  /** URL path params (e.g. :id): list of properties */
  params?: RouteProperty[]
  tags?: string[]
  /** Nested routes (same parent). Paths are already full paths from API. */
  routes?: RouteMeta[]
}

/** Flatten tree of routes into a single array (for counting and finding selection). */
export function flattenRoutesTree(routes: RouteMeta[]): RouteMeta[] {
  const out: RouteMeta[] = []
  for (const r of routes) {
    out.push(r)
    if (r.routes?.length) out.push(...flattenRoutesTree(r.routes))
  }
  return out
}
