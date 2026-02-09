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
  extractPathParamNames,
  getFirstTabFromConfig,
  getRouteTabKey,
  getVisibleTabs,
  normalizeParams,
  normalizeRequestBody,
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
  /** Validation errors per route (state only, not persisted). Keys are routeKey. */
  const [validationErrorsByRoute, setValidationErrorsByRoute] = React.useState<
    Record<string, { pathParamErrorKeys: string[]; bodyErrorKeys: string[] }>
  >({})
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

  const pathParamNames = React.useMemo(() => {
    if (!route) return []
    const fromMeta = normalizeParams(route.params).map((p) => p.name)
    if (fromMeta.length > 0) return fromMeta
    return extractPathParamNames(path)
  }, [route?.params, path])

  const queryParamNames = React.useMemo(
    () => (route ? normalizeParams(route.query).map((p) => p.name) : []),
    [route?.query]
  )

  const requiredBodyNames = React.useMemo(
    () =>
      route
        ? normalizeRequestBody(route.request).filter((p) => p.required === true).map((p) => p.name)
        : [],
    [route?.request]
  )

  const currentValidation = validationErrorsByRoute[routeKey]
  const pathParamErrorKeys = currentValidation?.pathParamErrorKeys ?? []
  const bodyErrorKeys = currentValidation?.bodyErrorKeys ?? []

  const handleSend = React.useCallback(async () => {
    const missingPath = pathParamNames.filter((name) => {
      const row = paramsRows.find((r) => r.key.trim() === name)
      return !row || !row.enabled || row.value.trim() === ""
    })
    const missingBody = requiredBodyNames.filter((name) => {
      const row = bodyRows.find((r) => r.key.trim() === name)
      return !row || !row.enabled || (row.value.trim() === "" && !row.file)
    })

    if (missingPath.length > 0 || missingBody.length > 0) {
      setValidationErrorsByRoute((prev) => ({
        ...prev,
        [routeKey]: {
          pathParamErrorKeys: missingPath,
          bodyErrorKeys: missingBody,
        },
      }))
      if (missingPath.length > 0) {
        setTabByRoute((prev) => ({ ...prev, [routeKey]: "params" }))
        setTabInUrl("params")
      } else {
        setTabByRoute((prev) => ({ ...prev, [routeKey]: "body" }))
        setTabInUrl("body")
      }
      return
    }

    const invalidJsonKeys = bodyRows
      .filter(
        (r) =>
          r.enabled &&
          r.key.trim() !== "" &&
          (r.type || "").toLowerCase() === "object" &&
          (() => {
            if (r.value.trim() === "") return false
            try {
              const parsed = JSON.parse(r.value)
              return typeof parsed !== "object" || parsed === null
            } catch {
              return true
            }
          })()
      )
      .map((r) => r.key.trim())
    if (invalidJsonKeys.length > 0) {
      setValidationErrorsByRoute((prev) => ({
        ...prev,
        [routeKey]: {
          pathParamErrorKeys: prev[routeKey]?.pathParamErrorKeys ?? [],
          bodyErrorKeys: invalidJsonKeys,
        },
      }))
      setTabByRoute((prev) => ({ ...prev, [routeKey]: "body" }))
      setTabInUrl("body")
      return
    }

    setValidationErrorsByRoute((prev) => {
      const next = { ...prev }
      delete next[routeKey]
      return next
    })
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
    route,
    routeKey,
    pathParamNames,
    queryParamNames,
    requiredBodyNames,
    paramsRows,
    bodyRows,
    headersRows,
    auth,
    setTabByRoute,
    setTabInUrl,
  ])


  React.useEffect(() => {
    if (!route || !routeKey) return
    const requestProperties = normalizeRequestBody(route.request)
    const initialBodyFromRoute = rowsFromProperties(requestProperties)
    const saved = fieldsByRouteRef.current[routeKey]
    if (saved) {
      setParamsRows(saved.params.map((r) => ({ ...r, id: r.id || crypto.randomUUID() })))
      // Restore saved body, but if saved body is empty and route has request fields now, use them
      const bodyToUse =
        saved.body.length === 0 && initialBodyFromRoute.length > 0
          ? initialBodyFromRoute
          : saved.body.map((r) => ({ ...r, id: r.id || crypto.randomUUID() }))
      setBodyRows(bodyToUse)
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
      if (saved.body.length === 0 && initialBodyFromRoute.length > 0) {
        fieldsByRouteRef.current[routeKey] = {
          ...saved,
          body: stripFiles(initialBodyFromRoute),
        }
      }
    } else {
      const queryProps = normalizeParams(route.query)
      const pathPropsFromMeta = normalizeParams(route.params)
      const pathProps =
        pathPropsFromMeta.length > 0
          ? pathPropsFromMeta
          : pathParamNames.map((name) => ({ name, type: "string" as const }))
      const queryAndParams = [...queryProps, ...pathProps]
      const initialParams = queryAndParams.length ? rowsFromProperties(queryAndParams) : []
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
      setBodyRows(initialBodyFromRoute)
      setHeadersRows(initialHeaders)
      setAuth({ type: "none" })
      fieldsByRouteRef.current[routeKey] = {
        params: initialParams,
        body: stripFiles(initialBodyFromRoute),
        headers: initialHeaders,
        auth: { type: "none" },
      }
    }
  }, [routeKey, route?.path, route?.method, route?.query, route?.params, route?.request, pathParamNames])

  React.useEffect(() => {
    if (!routeKey || !validationErrorsByRoute[routeKey]) return
    const missingPath = pathParamNames.filter((name) => {
      const row = paramsRows.find((r) => r.key.trim() === name)
      return !row || !row.enabled || row.value.trim() === ""
    })
    const missingBody = requiredBodyNames.filter((name) => {
      const row = bodyRows.find((r) => r.key.trim() === name)
      return !row || !row.enabled || (row.value.trim() === "" && !row.file)
    })
    if (missingPath.length === 0 && missingBody.length === 0) {
      setValidationErrorsByRoute((prev) => {
        const next = { ...prev }
        delete next[routeKey]
        return next
      })
    } else {
      setValidationErrorsByRoute((prev) => ({
        ...prev,
        [routeKey]: { pathParamErrorKeys: missingPath, bodyErrorKeys: missingBody },
      }))
    }
  }, [routeKey, pathParamNames, requiredBodyNames, paramsRows, bodyRows])

  React.useEffect(() => {
    if (!routeKey) return
    const cur = fieldsByRouteRef.current[routeKey]
    const nextParams = stripFiles(paramsRows)
    // Avoid overwriting with empty when init effect just ran (paramsRows not yet updated from setParamsRows)
    const params =
      nextParams.length === 0 && cur?.params?.length
        ? cur.params
        : nextParams
    fieldsByRouteRef.current[routeKey] = {
      params,
      body: stripFiles(bodyRows),
      headers: stripFiles(headersRows),
      auth: { ...auth },
    }
  }, [routeKey, paramsRows, bodyRows, headersRows, auth])

  if (!route) {
    return <ApiDetailsEmptyState />
  }

  const hasParams = pathParamNames.length > 0 || queryParamNames.length > 0
  const hasBody = normalizeRequestBody(route.request).length > 0
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
          pathParamErrorKeys={pathParamErrorKeys}
          bodyErrorKeys={bodyErrorKeys}
          pathParamRequiredKeys={pathParamNames}
          bodyRequiredKeys={requiredBodyNames}
        />
      </div>
    </div>
  )
}
