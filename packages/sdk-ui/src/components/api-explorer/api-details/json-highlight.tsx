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

/** Textarea overlay with JSON syntax highlighting behind the text. */
export const JsonHighlightTextarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea"> & { invalid?: boolean }
>(function JsonHighlightTextarea({ value = "", invalid, className, ...props }, ref) {
  const preRef = React.useRef<HTMLPreElement>(null)
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null)

  const syncScroll = React.useCallback(() => {
    const ta = textareaRef.current
    const pre = preRef.current
    if (ta && pre) {
      pre.scrollTop = ta.scrollTop
      pre.scrollLeft = ta.scrollLeft
    }
  }, [])

  const setRefs = React.useCallback(
    (el: HTMLTextAreaElement | null) => {
      textareaRef.current = el
      if (typeof ref === "function") ref(el)
      else if (ref) ref.current = el
    },
    [ref]
  )

  return (
    <div className="relative min-h-20 w-full">
      <pre
        ref={preRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-auto whitespace-pre-wrap wrap-break-word rounded-md border border-transparent px-2 py-1.5 font-mono text-xs"
        style={{ margin: 0 }}
      >
        <JsonHighlight className="block min-h-full">{String(value)}</JsonHighlight>
      </pre>
      <textarea
        ref={setRefs}
        value={value}
        onScroll={syncScroll}
        className={`absolute inset-0 min-h-full w-full resize-none overflow-auto rounded-md border bg-transparent px-2 py-1.5 font-mono text-xs caret-foreground text-transparent placeholder:text-muted-foreground outline-none focus-visible:ring-1 ${
          invalid ? "border-destructive focus-visible:ring-destructive" : "border-border focus-visible:ring-ring"
        } ${className ?? ""}`}
        spellCheck={false}
        {...props}
      />
    </div>
  )
})
