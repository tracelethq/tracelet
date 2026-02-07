import * as React from "react"

type TokenType = "key" | "string" | "number" | "boolean" | "null" | "punctuation" | "text"

interface Token {
  type: TokenType
  value: string
}

function tokenizeJson(str: string): Token[] {
  const tokens: Token[] = []
  let i = 0
  const n = str.length

  const peek = () => str[i]
  const take = () => (i < n ? str[i++] : "")
  const takeWhile = (pred: (c: string) => boolean) => {
    let s = ""
    while (i < n && pred(str[i])) s += take()
    return s
  }

  while (i < n) {
    const c = peek()
    if (c === '"') {
      let value = take()
      while (i < n) {
        const ch = take()
        value += ch
        if (ch === "\\") value += take()
        else if (ch === '"') break
      }
      let j = i
      while (j < n && (str[j] === " " || str[j] === "\t" || str[j] === "\n" || str[j] === "\r")) j++
      const isKey = j < n && str[j] === ":"
      tokens.push({ type: isKey ? "key" : "string", value })
      continue
    }
    if (c === " " || c === "\t" || c === "\n" || c === "\r") {
      tokens.push({ type: "text", value: takeWhile((x) => x === " " || x === "\t" || x === "\n" || x === "\r") })
      continue
    }
    if (c === "{" || c === "}" || c === "[" || c === "]" || c === ":" || c === ",") {
      tokens.push({ type: "punctuation", value: take() })
      continue
    }
    const numMatch = str.slice(i).match(/^-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/)
    if (numMatch) {
      tokens.push({ type: "number", value: numMatch[0] })
      i += numMatch[0].length
      continue
    }
    if (str.slice(i, i + 4) === "true") {
      tokens.push({ type: "boolean", value: "true" })
      i += 4
      continue
    }
    if (str.slice(i, i + 5) === "false") {
      tokens.push({ type: "boolean", value: "false" })
      i += 5
      continue
    }
    if (str.slice(i, i + 4) === "null") {
      tokens.push({ type: "null", value: "null" })
      i += 4
      continue
    }
    tokens.push({ type: "text", value: take() })
  }
  return tokens
}

function looksLikeJson(str: string): boolean {
  const trimmed = str.trim()
  return (trimmed.startsWith("{") && trimmed.endsWith("}")) || (trimmed.startsWith("[") && trimmed.endsWith("]"))
}

export function JsonHighlight({ children, className }: { children: string; className?: string }) {
  const tokens = React.useMemo(() => {
    if (!looksLikeJson(children)) return null
    try {
      return tokenizeJson(children)
    } catch {
      return null
    }
  }, [children])

  if (tokens === null) {
    return <span className={className}>{children}</span>
  }

  return (
    <code className={className} data-json-highlight>
      {tokens.map((t, idx) => (
        <span key={idx} data-json-token={t.type}>
          {t.value}
        </span>
      ))}
    </code>
  )
}
