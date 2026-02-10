import { Shape } from "../../types"

export function inferShape(value: unknown): Shape {
  if (value === null) return "null"

  if (Array.isArray(value)) {
    if (value.length === 0) return []
    return [inferShape(value[0])]
  }

  switch (typeof value) {
    case "string":
      return "string"
    case "number":
      return "number"
    case "boolean":
      return "boolean"
    case "object": {
      const obj: Record<string, Shape> = {}
      for (const [key, val] of Object.entries(value)) {
        obj[key] = inferShape(val)
      }
      return obj
    }
    default:
      return "unknown"
  }
}
