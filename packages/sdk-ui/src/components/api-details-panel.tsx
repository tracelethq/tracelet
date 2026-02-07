import * as React from "react"
import { useResponseTab, useRouteInUrl, useTabByRoute } from "@/hooks/use-tracelet-persistence"
import type { RouteMeta } from "@/types/route"
import {
  buildCurlRequest,
  buildBody,
  buildHeaders,
  buildUrl,
  type ResponseState,
} from "./api-details/api-response-panel"
import { ApiDetailsEmptyState } from "./api-details/empty-state"
import { ApiDetailsHeader } from "./api-details/header"
import { RouteTabs } from "./api-details/route-tabs"
import {
  DEFAULT_TABS_CONFIG,
  type ApiTabValue,
  type AuthState,
  type ParamRow,
  type TabConfigItem,
  getFirstTabFromConfig,
  getRouteTabKey,
  getVisibleTabs,
  rowsFromProperties,
} from "./api-details/types"

export interface ApiDetailsPanelProps {
  route: RouteMeta | null
  apiBase: string
  /** Optional tab config (order/labels/visibility). JSON-serializable. */
  tabsConfig?: TabConfigItem[]
}

type SavedFields = {
  params: ParamRow[]
  body: ParamRow[]
  headers: ParamRow[]
  auth: AuthState
}

function stripFiles(rows: ParamRow[]): ParamRow[] {
  return rows.map(({ file, ...r }) => ({ ...r, file: undefined }))
}

export function ApiDetailsPanel({ route, apiBase, tabsConfig }: ApiDetailsPanelProps) {
  const { setTabInUrl } = useRouteInUrl()
  const [tabByRoute, setTabByRoute] = useTabByRoute()
  const [paramsRows, setParamsRows] = React.useState<ParamRow[]>([])
  const [bodyRows, setBodyRows] = React.useState<ParamRow[]>([])
  const [headersRows, setHeadersRows] = React.useState<ParamRow[]>([
    {
      id: crypto.randomUUID(),
      key: "",
      value: "",
      type: "String",
      enabled: true,
    },
  ])
  const [responseByRoute, setResponseByRoute] = React.useState<
    Record<string, ResponseState | null>
  >({})
  const [resizeLayout, setResizeLayout] = React.useState<
    { [panelId: string]: number } | undefined
  >(undefined)
  const [auth, setAuth] = React.useState<AuthState>({ type: "none" })
  const [sendLoading, setSendLoading] = React.useState(false)

  const fieldsByRouteRef = React.useRef<Record<string, SavedFields>>({})

  const method = route
    ? typeof route.method === "string"
      ? route.method
      : String(route.method)
    : ""
  const path = route
    ? typeof route.path === "string"
      ? route.path || "/"
      : "/"
    : "/"
  const routeKey = route ? getRouteTabKey(method, path) : ""
  const [responseTab, setResponseTab] = useResponseTab(routeKey || "_")

  const pathParamNames = React.useMemo(
    () =>
      route && Array.isArray(route.params)
        ? route.params.map((p) => p.name)
        : [],
    [route?.params]
  )
  const queryParamNames = React.useMemo(
    () =>
      route && Array.isArray(route.query)
        ? route.query.map((p) => p.name)
        : [],
    [route?.query]
  )

  const handleSend = React.useCallback(async () => {
    setSendLoading(true)
    const start = performance.now()
    try {
      const url = buildUrl(
        apiBase,
        path,
        pathParamNames,
        queryParamNames,
        paramsRows
      )
      const headers = buildHeaders(headersRows)
      if (auth.type === "bearer" && auth.bearerToken?.trim()) {
        headers["Authorization"] = `Bearer ${auth.bearerToken.trim()}`
      }
      if (auth.type === "basic" && auth.username != null && auth.password != null) {
        headers["Authorization"] = `Basic ${btoa(
          `${auth.username}:${auth.password}`
        )}`
      }
      if (auth.type === "apiKey" && auth.apiKeyName?.trim() && auth.apiKeyValue != null) {
        headers[auth.apiKeyName.trim()] = auth.apiKeyValue
      }
      const body = buildBody(method, bodyRows)
      if (body && !headers["Content-Type"] && typeof body === "string") {
        headers["Content-Type"] = "application/json"
      }
      const res = await fetch(url, {
        method: method.toUpperCase(),
        headers: Object.keys(headers).length ? headers : undefined,
        body: body ?? undefined,
      })
      const headersObj: Record<string, string> = {}
      res.headers.forEach((value, key) => {
        headersObj[key] = value
      })
      let bodyText: string
      const contentType = res.headers.get("content-type") ?? ""
      try {
        if (contentType.includes("application/json")) {
          const json = await res.json()
          bodyText = JSON.stringify(json, null, 2)
        } else {
          bodyText = await res.text()
        }
      } catch {
        bodyText = "(unable to read body)"
      }
      const durationMs = Math.round(performance.now() - start)
      const state: ResponseState = {
        status: res.status,
        statusText: res.statusText,
        headers: headersObj,
        body: bodyText,
        error: null,
        durationMs,
      }
      setResponseByRoute((prev) => ({ ...prev, [routeKey]: state }))
    } catch (err) {
      const durationMs = Math.round(performance.now() - start)
      const state: ResponseState = {
        status: null,
        statusText: "",
        headers: {},
        body: "",
        error: err instanceof Error ? err.message : "Request failed",
        durationMs,
      }
      setResponseByRoute((prev) => ({ ...prev, [routeKey]: state }))
    } finally {
      setSendLoading(false)
    }
  }, [
    apiBase,
    method,
    path,
    routeKey,
    pathParamNames,
    queryParamNames,
    paramsRows,
    bodyRows,
    headersRows,
    auth,
  ])

  React.useEffect(() => {
    if (!route || !routeKey) return
    const saved = fieldsByRouteRef.current[routeKey]
    if (saved) {
      setParamsRows(saved.params.map((r) => ({ ...r, id: r.id || crypto.randomUUID() })))
      setBodyRows(saved.body.map((r) => ({ ...r, id: r.id || crypto.randomUUID() })))
      setHeadersRows(
        saved.headers.length > 0
          ? saved.headers.map((r) => ({ ...r, id: r.id || crypto.randomUUID() }))
          : [
              {
                id: crypto.randomUUID(),
                key: "",
                value: "",
                type: "String",
                enabled: true,
              },
            ]
      )
      setAuth(saved.auth)
    } else {
      const queryAndParams = [
        ...(Array.isArray(route.query) ? route.query : []),
        ...(Array.isArray(route.params) ? route.params : []),
      ]
      const initialParams = queryAndParams.length ? rowsFromProperties(queryAndParams) : []
      const initialBody = rowsFromProperties(route.request)
      const initialHeaders: ParamRow[] = [
        {
          id: crypto.randomUUID(),
          key: "",
          value: "",
          type: "String",
          enabled: true,
        },
      ]
      setParamsRows(initialParams)
      setBodyRows(initialBody)
      setHeadersRows(initialHeaders)
      setAuth({ type: "none" })
      fieldsByRouteRef.current[routeKey] = {
        params: initialParams,
        body: stripFiles(initialBody),
        headers: initialHeaders,
        auth: { type: "none" },
      }
    }
  }, [routeKey, route?.path, route?.method, route?.query, route?.params, route?.request])

  React.useEffect(() => {
    if (!routeKey) return
    fieldsByRouteRef.current[routeKey] = {
      params: stripFiles(paramsRows),
      body: stripFiles(bodyRows),
      headers: stripFiles(headersRows),
      auth: { ...auth },
    }
  }, [routeKey, paramsRows, bodyRows, headersRows, auth])

  if (!route) {
    return <ApiDetailsEmptyState />
  }

  const hasParams =
    (Array.isArray(route.query) && route.query.length > 0) ||
    (Array.isArray(route.params) && route.params.length > 0)
  const hasBody = Array.isArray(route.request) && route.request.length > 0
  const hasResponseTypes =
    Array.isArray(route.responses) && route.responses.length > 0

  const config = tabsConfig ?? DEFAULT_TABS_CONFIG
  const visibleTabIds = React.useMemo(
    () =>
      getVisibleTabs(config, {
        hasParams,
        hasBody,
        hasResponseTypes,
      }).map((t) => t.id),
    [config, hasParams, hasBody, hasResponseTypes]
  )
  const firstTab = getFirstTabFromConfig(config, {
    hasParams,
    hasBody,
    hasResponseTypes,
  })
  const savedTab = tabByRoute[routeKey]
  const isValidSaved = savedTab && visibleTabIds.includes(savedTab)
  const activeTab: ApiTabValue = isValidSaved ? savedTab : firstTab

  // When persisted tab is not in visible tabs, persist first tab and update URL
  React.useEffect(() => {
    if (!routeKey) return
    const saved = tabByRoute[routeKey]
    if (saved && !visibleTabIds.includes(saved)) {
      setTabByRoute((prev) => ({ ...prev, [routeKey]: firstTab }))
      setTabInUrl(firstTab)
    }
  }, [routeKey, firstTab, visibleTabIds, tabByRoute, setTabByRoute, setTabInUrl])

  const handleTabChange = React.useCallback(
    (value: ApiTabValue) => {
      setTabByRoute((prev) => ({ ...prev, [routeKey]: value }))
      setTabInUrl(value)
    },
    [routeKey, setTabByRoute, setTabInUrl]
  )

  const lastResponse = responseByRoute[routeKey] ?? null
  const handleLayoutChanged = React.useCallback(
    (layout: { [panelId: string]: number }) => setResizeLayout(layout),
    []
  )

  const getCurlRequest = React.useCallback(
    () =>
      buildCurlRequest(
        apiBase,
        path,
        method,
        pathParamNames,
        queryParamNames,
        paramsRows,
        headersRows,
        bodyRows,
        auth
      ),
    [
      apiBase,
      path,
      method,
      pathParamNames,
      queryParamNames,
      paramsRows,
      headersRows,
      bodyRows,
      auth,
    ]
  )

  const fetchUrl = React.useMemo(
    () =>
      buildUrl(
        apiBase,
        path,
        pathParamNames,
        queryParamNames,
        paramsRows
      ),
    [
      apiBase,
      path,
      pathParamNames,
      queryParamNames,
      paramsRows,
    ]
  )

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <ApiDetailsHeader
        route={route}
        onSend={handleSend}
        sendLoading={sendLoading}
        getCurlRequest={getCurlRequest}
        fetchUrl={fetchUrl}
      />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <RouteTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
          hasParams={hasParams}
          hasBody={hasBody}
          hasResponseTypes={hasResponseTypes}
          paramsRows={paramsRows}
          setParamsRows={setParamsRows}
          bodyRows={bodyRows}
          setBodyRows={setBodyRows}
          headersRows={headersRows}
          setHeadersRows={setHeadersRows}
          route={route}
          response={lastResponse}
          sendLoading={sendLoading}
          resizeLayout={resizeLayout}
          onResizeLayoutChanged={handleLayoutChanged}
          auth={auth}
          setAuth={setAuth}
          tabsConfig={tabsConfig}
          responseTab={responseTab}
          onResponseTabChange={setResponseTab}
        />
      </div>
    </div>
  )
}
