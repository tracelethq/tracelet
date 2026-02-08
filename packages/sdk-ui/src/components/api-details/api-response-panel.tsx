import * as React from "react";
import { CopyIcon, Loader2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ResponseTabValue } from "@/hooks/use-tracelet-persistence";
import { JsonHighlight } from "./json-highlight";
import { TAB_CLASS, type AuthState, type ParamRow } from "./types";

export interface ResponseState {
  status: number | null;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  error: string | null;
  /** Response time in milliseconds, if available */
  durationMs?: number;
}

export type ResponseViewFormat = "json" | "html" | "raw";

interface ApiResponsePanelProps {
  routeKey: string;
  response: ResponseState | null;
  loading: boolean;
  /** Controlled from parent so one source of truth (persisted per route). */
  responseTab: ResponseTabValue;
  onResponseTabChange: (value: ResponseTabValue) => void;
}

export function buildUrl(
  base: string,
  pathTemplate: string,
  pathParamNames: string[],
  queryParamNames: string[],
  paramsRows: ParamRow[],
): string {
  const pathParamSet = new Set(pathParamNames);
  const queryParamSet = new Set(queryParamNames);
  let path = pathTemplate;
  const queryParts: string[] = [];

  for (const row of paramsRows) {
    if (!row.enabled || row.key.trim() === "") continue;
    const value = encodeURIComponent(row.value.trim());
    if (pathParamSet.has(row.key)) {
      path = path.replace(new RegExp(`:${row.key}(?=/|$)`), value);
    } else if (queryParamSet.has(row.key)) {
      queryParts.push(`${encodeURIComponent(row.key)}=${value}`);
    }
  }

  const baseClean = base.replace(/\/$/, "");
  const pathClean = path.startsWith("/") ? path : `/${path}`;
  const url = `${baseClean}${pathClean}`;
  return queryParts.length ? `${url}?${queryParts.join("&")}` : url;
}

export function buildBody(
  method: string,
  bodyRows: ParamRow[],
  bodyJson?: string
): string | FormData | undefined {
  const methodsWithBody = ["POST", "PUT", "PATCH"];
  if (!methodsWithBody.includes(method.toUpperCase())) return undefined;
  if (bodyJson != null && bodyJson.trim() !== "") {
    try {
      JSON.parse(bodyJson);
      return bodyJson.trim();
    } catch {
      /* fall through to bodyRows */
    }
  }
  const hasFile = bodyRows.some(
    (r) => r.enabled && r.key.trim() !== "" && r.type === "File" && r.file
  );
  if (hasFile) {
    const form = new FormData();
    for (const row of bodyRows) {
      if (!row.enabled || row.key.trim() === "") continue;
      if (row.type === "File" && row.file) {
        form.append(row.key, row.file);
      } else {
        form.append(row.key, row.value);
      }
    }
    return form;
  }
  const obj: Record<string, unknown> = {};
  for (const row of bodyRows) {
    if (!row.enabled || row.key.trim() === "") continue;
    const type = (row.type || "").toLowerCase();
    if (type === "array") {
      try {
        const parsed = JSON.parse(row.value || "[]");
        obj[row.key] = Array.isArray(parsed) ? parsed : [row.value];
      } catch {
        obj[row.key] = [];
      }
    } else if (type === "object") {
      try {
        const parsed = JSON.parse(row.value || "{}");
        obj[row.key] = typeof parsed === "object" && parsed !== null ? parsed : {};
      } catch {
        obj[row.key] = {};
      }
    } else {
      obj[row.key] = row.value;
    }
  }
  if (Object.keys(obj).length === 0) return undefined;
  return JSON.stringify(obj);
}

export function buildHeaders(headersRows: ParamRow[]): Record<string, string> {
  const headers: Record<string, string> = {};
  for (const row of headersRows) {
    if (!row.enabled || row.key.trim() === "") continue;
    headers[row.key.trim()] = row.value;
  }
  return headers;
}

/** Build a curl command string from current request state. */
export function buildCurlRequest(
  apiBase: string,
  pathTemplate: string,
  method: string,
  pathParamNames: string[],
  queryParamNames: string[],
  paramsRows: ParamRow[],
  headersRows: ParamRow[],
  bodyRows: ParamRow[],
  auth: AuthState,
  bodyJson?: string
): string {
  const url = buildUrl(
    apiBase,
    pathTemplate,
    pathParamNames,
    queryParamNames,
    paramsRows
  );
  const headers = buildHeaders(headersRows);
  if (auth.type === "bearer" && auth.bearerToken?.trim()) {
    headers["Authorization"] = `Bearer ${auth.bearerToken.trim()}`;
  }
  if (auth.type === "basic" && auth.username != null && auth.password != null) {
    headers["Authorization"] = `Basic ${btoa(
      `${auth.username}:${auth.password}`
    )}`;
  }
  if (
    auth.type === "apiKey" &&
    auth.apiKeyName?.trim() &&
    auth.apiKeyValue != null
  ) {
    headers[auth.apiKeyName.trim()] = auth.apiKeyValue;
  }
  const body = buildBody(method, bodyRows, bodyJson);

  const escapeForShell = (s: string) => s.replace(/'/g, "'\"'\"'");
  const parts = ["curl", "-X", method.toUpperCase(), escapeForShell(url)];
  for (const [key, value] of Object.entries(headers)) {
    parts.push("-H", `'${key}: ${escapeForShell(value)}'`);
  }
  if (typeof body === "string" && body !== "") {
    parts.push("--data-raw", `'${escapeForShell(body)}'`);
  }
  return parts.join(" ");
}

export function ApiResponsePanel({
  routeKey: _routeKey,
  response,
  loading,
  responseTab,
  onResponseTabChange,
}: ApiResponsePanelProps) {
  const [format, setFormat] = React.useState<ResponseViewFormat>("json");
  const [copied, setCopied] = React.useState(false);

  const headerEntries = response?.headers
    ? Object.entries(response.headers)
    : [];

  const handleCopyResponse = React.useCallback(async () => {
    if (!response) return;
    const text =
      responseTab === "response"
        ? response.body || "(empty)"
        : headerEntries.map(([k, v]) => `${k}: ${v}`).join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }, [response, responseTab, headerEntries]);

  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <Tabs
        value={responseTab}
        onValueChange={(v) => onResponseTabChange(v as ResponseTabValue)}
        className="flex min-h-0 flex-1 flex-col overflow-hidden"
      >
        <div className="text-muted-foreground flex h-9 shrink-0 w-full items-center justify-between gap-3 border-b border-border px-4">
          <TabsList className="h-auto w-auto justify-start rounded-none border-0 bg-transparent p-0">
            <TabsTrigger value="response" className={TAB_CLASS}>
              Response
            </TabsTrigger>
            <TabsTrigger value="headers" className={TAB_CLASS}>
              Headers
            </TabsTrigger>
          </TabsList>
          <div className="flex shrink-0 items-center gap-3">
            {response && response.status != null && (
              <span className="font-mono text-xs text-foreground">
                {response.status} {response.statusText}
              </span>
            )}
            {response?.durationMs != null && (
              <span className="font-mono text-xs">{response.durationMs} ms</span>
            )}
            {!response && !loading && (
              <span className="text-xs">—</span>
            )}
            {response && !loading && (
              <Button
                variant="outline"
                size="sm"
                className="h-6 gap-1 px-2 text-xs"
                onClick={handleCopyResponse}
              >
                <CopyIcon className="size-3" />
                {copied ? "Copied" : "Copy"}
              </Button>
            )}
            <div className="flex gap-0.5 rounded-md border border-border bg-muted/50 p-0.5">
              <Button
                variant={format === "json" ? "secondary" : "ghost"}
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => setFormat("json")}
              >
                JSON
              </Button>
              <Button
                variant={format === "html" ? "secondary" : "ghost"}
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => setFormat("html")}
              >
                HTML
              </Button>
              <Button
                variant={format === "raw" ? "secondary" : "ghost"}
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => setFormat("raw")}
              >
                Raw
              </Button>
            </div>
          </div>
        </div>

        <TabsContent
          value="response"
          className="mt-0 flex min-h-0 flex-1 flex-col overflow-auto data-[state=inactive]:hidden px-2"
        >
          <div className="bg-muted/30 flex min-h-[120px] min-w-0 flex-1 flex-col overflow-hidden rounded-md border border-dashed border-border">
            {!response && !loading && (
              <div className="flex flex-1 items-center justify-center p-8 text-center text-muted-foreground text-xs">
                Click Send above to run the request
              </div>
            )}
            {loading && (
              <div className="flex flex-1 items-center justify-center gap-2 p-8 text-muted-foreground text-xs">
                <Loader2Icon className="size-4 animate-spin" />
                Sending…
              </div>
            )}
            {response && !loading && (
              <div className="flex flex-1 flex-col overflow-hidden p-3">
                {response.error && (
                  <p className="text-destructive mb-2 text-xs font-medium">
                    {response.error}
                  </p>
                )}
                {format === "json" && (
                  <pre className="bg-background/80 max-h-full min-h-0 flex-1 overflow-auto rounded border border-border p-2 font-mono text-xs whitespace-pre-wrap break-all">
                    <JsonHighlight className="block">
                      {response.body || "(empty)"}
                    </JsonHighlight>
                  </pre>
                )}
                {format === "html" && (
                  <iframe
                    title="Response HTML"
                    sandbox=""
                    srcDoc={response.body || ""}
                    className="bg-background border-border min-h-0 flex-1 rounded border overflow-auto"
                  />
                )}
                {format === "raw" && (
                  <pre className="bg-background/80 max-h-full min-h-0 flex-1 overflow-auto rounded border border-border p-2 font-mono text-xs whitespace-pre-wrap break-all">
                    {response.body || "(empty)"}
                  </pre>
                )}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent
          value="headers"
          className="mt-0 flex min-h-0 flex-1 flex-col overflow-auto data-[state=inactive]:hidden px-2"
        >
          <div className="bg-muted/30 flex min-h-[120px] min-w-0 flex-1 flex-col overflow-hidden rounded-md border border-dashed border-border">
            {!response && !loading && (
              <div className="flex flex-1 items-center justify-center p-8 text-center text-muted-foreground text-xs">
                Click Send above to see response headers
              </div>
            )}
            {loading && (
              <div className="flex flex-1 items-center justify-center gap-2 p-8 text-muted-foreground text-xs">
                <Loader2Icon className="size-4 animate-spin" />
                Sending…
              </div>
            )}
            {response && !loading && (
              <div className="flex flex-1 flex-col overflow-auto p-0">
                {headerEntries.length === 0 ? (
                  <div className="text-muted-foreground py-6 text-center text-xs">
                    No headers
                  </div>
                ) : (
                  <ul className="divide-y divide-border/50">
                    {headerEntries.map(([key, value]) => (
                      <li
                        key={key}
                        className="grid grid-cols-[minmax(0,auto)_1fr] items-center gap-4 px-4 py-3 text-xs text-foreground even:bg-background/5"
                      >
                        <span className="font-mono text-muted-foreground">
                          {key}
                        </span>
                        <span className="min-w-0 break-all font-mono">
                          {value}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}
