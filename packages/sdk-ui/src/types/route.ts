/** Single request/response property (matches @tracelet/express TraceletProperty) */
export type RouteProperty = {
  name: string
  type: string
  desc?: string
  required?: boolean
  enum?: readonly string[]
}

/** Response type per status code (matches TraceletResponseProperty) */
export type RouteResponseType = {
  status: number
  description?: string
  properties: RouteProperty[]
}

export type RouteMeta = {
  method: string
  path: string
  description?: string
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
