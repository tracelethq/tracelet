import { TraceEventInput, TraceEvent } from "../../types"
import { sanitize } from "../sanitize/sanitize"
import { inferShape } from "../infer/inferShape"

export function createTraceEvent(
  input: TraceEventInput
): TraceEvent {
  const {
    method,
    path,
    status,
    duration,
    requestBody,
    responseBody
  } = input

  return {
    method,
    path,
    status,
    duration,
    requestShape: inferShape(sanitize(requestBody)),
    responseShape: inferShape(sanitize(responseBody)),
    timestamp: Date.now()
  }
}
