# @tracelet/core

Framework-agnostic core logic for Tracelet SDKs.

This package handles:

- request/response sanitization
- schema inference
- trace event creation

It contains **no framework-specific code**.

## Usage

```ts
import { createTraceEvent } from "@tracelet/core"

const event = createTraceEvent({
  method: "POST",
  path: "/users/:id",
  status: 200,
  duration: 12,
  requestBody: { name: "John", password: "secret" },
  responseBody: { id: "123" }
})
```

