const DEFAULT_SENSITIVE_KEYS = [
    "password",
    "token",
    "access_token",
    "refresh_token",
    "secret",
    "apikey",
    "api_key",
    "authorization"
  ]
  
  export function sanitize(
    value: unknown,
    sensitiveKeys: string[] = DEFAULT_SENSITIVE_KEYS
  ): unknown {
    if (value === null || value === undefined) return value
  
    if (Array.isArray(value)) {
      return value.map((item) => sanitize(item, sensitiveKeys))
    }
  
    if (typeof value === "object") {
      const result: Record<string, unknown> = {}
  
      for (const [key, val] of Object.entries(value)) {
        if (sensitiveKeys.includes(key.toLowerCase())) {
          result[key] = "[REDACTED]"
        } else {
          result[key] = sanitize(val, sensitiveKeys)
        }
      }
  
      return result
    }
  
    return value
  }
  