/**
 * Frontend types for API Explorer (mirrors TraceletMeta from SDK).
 */

export type TraceletHttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "HEAD"
  | "OPTIONS"
  | "PARENT";

export interface TraceletProperty {
  name: string;
  type: string;
  desc?: string;
  required?: boolean;
  enum?: readonly string[];
  accept?: string;
  maxFiles?: number;
}

export interface TraceletResponseProperty {
  status: number;
  description?: string;
  properties: TraceletProperty[];
}

export type RequestContentType = "application/json" | "multipart/form-data";

export interface TraceletMeta {
  description?: string;
  method: TraceletHttpMethod;
  path: string;
  requestContentType?: RequestContentType;
  request?: TraceletProperty[];
  responses?: TraceletResponseProperty[];
  query?: TraceletProperty[];
  params?: TraceletProperty[];
  tags?: readonly string[];
  routes?: TraceletMeta[];
  groupKey?: string;
}

/** Flattened route with full path (for list display). */
export interface FlattenedRoute {
  method: TraceletMeta["method"];
  path: string;
  fullPath: string;
  description?: string;
  request?: TraceletProperty[];
  responses?: TraceletResponseProperty[];
  query?: TraceletProperty[];
  params?: TraceletProperty[];
  tags?: readonly string[];
  requestContentType?: RequestContentType;
}
