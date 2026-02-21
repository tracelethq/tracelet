// Express type augmentation for Tracelet.
//
// This file is imported by `src/index.ts` so that consumers automatically get

import type { Logger } from "@tracelet/core";

declare global {
  namespace Express {
    interface Request {
      traceletRequestId?: string;
      traceletTracingId?: string;
      traceletLogger?: Logger;
    }
  }
}

/** Re-export meta types from core so consumers can keep importing from @tracelet/express */
export type {
  RequestContentType,
  TraceletMeta,
  TraceletHttpMethod,
  TraceletProperty,
  TraceletResponseProperty,
} from "@tracelet/core";

/** Map of field name to type/schema (query, params – simple key/value) */
export type TraceletSchema = Record<string, string>;

export {};

