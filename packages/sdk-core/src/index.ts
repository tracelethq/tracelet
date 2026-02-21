export * from "./types"
export { sanitize } from "./lib/sanitize/sanitize"
export { inferShape } from "./lib/infer/inferShape"
export { createTraceEvent } from "./lib/event/createTraceEvent"
export { Logger } from "./logger/index"
export { resolveDefaultUiPath } from "./lib/resolveUiPath"
export {
  DEFAULT_DOC_FILE,
  RouteMeta,
} from "./meta"

export type {
  RequestContentType,
  RouteMetaOptions,
  TraceletMeta,
  TraceletHttpMethod,
  TraceletProperty,
  TraceletResponseProperty,
} from "./meta"

export { getEnv } from "./lib/env"
export { Auth, createAuth } from "./lib/auth"

export type { AuthOptions, JwtPayload } from "./lib/auth"
export type { HttpLogInput, LoggerOptions, LogPayload, RequestIds } from "./logger/index"
export { IngestClient, toIngestLogEntry } from "./ingest"
export type { IngestClientOptions, IngestLogEntry, IngestPayload, IngestResult } from "./ingest"
export { TraceletCore } from "./main"
