export type PrimitiveType =
  | "string"
  | "number"
  | "boolean"
  | "null"
  | "unknown"

export type Shape =
  | PrimitiveType
  | { [key: string]: Shape }
  | Shape[]

export interface TraceEventInput {
  method: string
  path: string
  status: number
  duration: number
  requestBody?: unknown
  responseBody?: unknown
}

export interface TraceEvent {
  method: string
  path: string
  status: number
  duration: number
  requestShape: Shape
  responseShape: Shape
  timestamp: number
}
