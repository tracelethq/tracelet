// Express type augmentation for Tracelet.
//
// This file is imported by `src/index.ts` so that consumers automatically get

import { createLogger } from "@tracelet/core";

// the `req.traceletRequestId` type when they import `@tracelet/express`.
declare global {
  namespace Express {
    interface Request {
      traceletRequestId?: string;
      traceletLogger?: ReturnType<typeof createLogger>;
    }
  }
}

/** Supported HTTP methods for route metadata */
export type TraceletHttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "HEAD"
  | "OPTIONS"
  | "PARENT"

/**
 * Definition of a single request/response property.
 */
export interface TraceletProperty {
  /** Property name */
  name: string
  /** Type name (e.g. "string", "number", "boolean", "object", "array", "enum", "file") */
  type: string
  /** Human-readable description */
  desc?: string
  /** Whether the property is required */
  required?: boolean
  /** When type is "enum", the list of allowed values */
  enum?: readonly string[]
  /** When type is "file": accepted file types (e.g. "image/*", ".pdf", "application/json"). Same as HTML input accept. */
  accept?: string
  /** When type is "file": maximum number of files allowed (default 1). Use > 1 for multiple file upload. */
  maxFiles?: number
}

export interface TraceletResponseProperty{
  status: number
  description?: string
  properties: TraceletProperty[]
}

/** Map of field name to type/schema (query, params – simple key/value) */
export type TraceletSchema = Record<string, string>

/**
 * Metadata for a single API route, used by Tracelet doc UI and tooling.
 * Routes can be nested via `routes`; child paths are resolved relative to the parent path.
 */
/** Preferred request body content type for the Try-it UI. If set, the UI uses it; otherwise the user can choose and the choice is remembered per route. */
export type RequestContentType = "application/json" | "multipart/form-data"

export interface TraceletMeta {
  /** Short description of the endpoint */
  description?: string
  /** HTTP method */
  method: TraceletHttpMethod
  /** Route path (e.g. "/users", "/posts/:id"). For nested routes, use a path relative to the parent. */
  path: string
  /** Preferred request body type: application/json or multipart/form-data. When set, UI uses it; else user can select and value is remembered per route. */
  requestContentType?: RequestContentType
  /** Request body: list of properties with name, type, desc, required, enum */
  request?: TraceletProperty[]
  /** Response types per status code: status, description, and properties for each */
  responses?: TraceletResponseProperty[]
  /** Query parameters schema */
  query?: TraceletProperty[]
  /** URL path params schema (name, type, desc, required, enum) */
  params?: TraceletProperty[]
  /** Tags for grouping/filtering (e.g. Swagger) */
  tags?: readonly string[]
  /** Nested routes: paths are resolved relative to this route's path (e.g. parent "/users", child ":id" → "/users/:id"). */
  routes?: TraceletMeta[]
  /** Set when flattening nested routes: parent path for UI grouping so routes with the same parent appear together. */
  groupKey?: string
}

export {};

