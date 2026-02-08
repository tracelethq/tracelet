import * as React from "react"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import type { RouteMeta } from "@/types/route"
import { ApiResponsePanel, type ResponseState } from "./api-response-panel"
import { AuthorizationTab } from "./authorization-tab"
import { JsonHighlight } from "./json-highlight"
import { ParamsTable } from "./params-table"
import { DetailsTab } from "./details-tab"
import type { ApiTabValue } from "./types"
import type { ResponseTabValue } from "@/hooks/use-tracelet-persistence"
import {
  DEFAULT_TABS_CONFIG,
  getRouteTabKey,
  getVisibleTabs,
  requestBodySampleJson,
  TAB_CLASS,
  type AuthState,
  type ParamRow,
  type TabConfigItem,
} from "./types"

export interface RouteTabsProps {
  activeTab: ApiTabValue
  onTabChange: (value: ApiTabValue) => void
  hasParams: boolean
  hasBody: boolean
  hasResponseTypes: boolean
  paramsRows: ParamRow[]
  setParamsRows: React.Dispatch<React.SetStateAction<ParamRow[]>>
  bodyRows: ParamRow[]
  setBodyRows: React.Dispatch<React.SetStateAction<ParamRow[]>>
  headersRows: ParamRow[]
  setHeadersRows: React.Dispatch<React.SetStateAction<ParamRow[]>>
  route: RouteMeta
  response: ResponseState | null
  sendLoading: boolean
  resizeLayout?: { [panelId: string]: number }
  onResizeLayoutChanged?: (layout: { [panelId: string]: number }) => void
  auth: AuthState
  setAuth: React.Dispatch<React.SetStateAction<AuthState>>
  /** Tab order and labels. JSON-serializable. Defaults to DEFAULT_TABS_CONFIG. */
  tabsConfig?: TabConfigItem[]
  /** Response panel tab (response/headers), controlled from parent for persistence. */
  responseTab: ResponseTabValue
  onResponseTabChange: (value: ResponseTabValue) => void
  /** Path param keys that are required but missing (highlight in Params tab). */
  pathParamErrorKeys?: string[]
  /** Body keys that are required but missing (highlight in Body tab). */
  bodyErrorKeys?: string[]
  /** Path param keys that are required (show required indicator in Params tab). */
  pathParamRequiredKeys?: string[]
  /** Body keys that are required (show required indicator in Body tab). */
  bodyRequiredKeys?: string[]
}

export function RouteTabs({
  activeTab,
  onTabChange,
  hasParams,
  hasBody,
  hasResponseTypes,
  paramsRows,
  setParamsRows,
  bodyRows,
  setBodyRows,
  headersRows,
  setHeadersRows,
  route,
  response,
  sendLoading,
  resizeLayout,
  onResizeLayoutChanged,
  auth,
  setAuth,
  tabsConfig = DEFAULT_TABS_CONFIG,
  responseTab,
  onResponseTabChange,
  pathParamErrorKeys = [],
  bodyErrorKeys = [],
  pathParamRequiredKeys = [],
  bodyRequiredKeys = [],
}: RouteTabsProps) {
  const visibleTabs = React.useMemo(
    () =>
      getVisibleTabs(tabsConfig, {
        hasParams,
        hasBody,
        hasResponseTypes,
      }),
    [tabsConfig, hasParams, hasBody, hasResponseTypes]
  )

  const routeKey = getRouteTabKey(
    typeof route.method === "string" ? route.method : String(route.method),
    typeof route.path === "string" ? route.path || "/" : "/"
  )
  const responsePanel = (
    <ApiResponsePanel
      routeKey={routeKey}
      response={response}
      loading={sendLoading}
      responseTab={responseTab}
      onResponseTabChange={onResponseTabChange}
    />
  )
  const contentClass =
    "mt-0 flex min-h-0 flex-1 flex-col overflow-hidden data-[state=inactive]:hidden"
  const panelGroupClass = "flex-1 min-h-0"

  const resizableProps = {
    defaultLayout: resizeLayout,
    onLayoutChanged: onResizeLayoutChanged,
  }

  function renderTabContent(value: ApiTabValue) {
    const inner = (() => {
      switch (value) {
        case "details": {
          const requestBodySample = requestBodySampleJson(route.request)
          return (
            <section className="flex flex-col gap-6 overflow-auto">
              {requestBodySample !== "{}" && (
                <div className="flex flex-col gap-2">
                  <h3 className="text-muted-foreground text-xs font-medium">
                    Request body (JSON)
                  </h3>
                  <pre className="bg-muted/50 rounded-md border border-border p-3 font-mono text-xs overflow-auto">
                    <JsonHighlight>{requestBodySample}</JsonHighlight>
                  </pre>
                </div>
              )}
              <DetailsTab responses={route.responses ?? []} />
            </section>
          )
        }
        case "params":
          return (
            <section className="flex flex-col overflow-auto">
              <h3 className="text-muted-foreground mb-2 text-xs font-medium">
                Query Params
              </h3>
              <ParamsTable
                rows={paramsRows}
                setRows={setParamsRows}
                allowAddMore={false}
                showTypeColumn
                errorKeys={pathParamErrorKeys}
                requiredKeys={pathParamRequiredKeys}
              />
            </section>
          )
        case "body":
          return (
            <section className="flex flex-col overflow-auto">
              <h3 className="text-muted-foreground mb-2 text-xs font-medium">
                Request Body
              </h3>
              <ParamsTable
                rows={bodyRows}
                setRows={setBodyRows}
                allowAddMore={false}
                showTypeColumn
                errorKeys={bodyErrorKeys}
                requiredKeys={bodyRequiredKeys}
              />
            </section>
          )
        case "headers":
          return (
            <section className="flex flex-col overflow-auto">
              <h3 className="text-muted-foreground mb-2 text-xs font-medium">
                Headers
              </h3>
              <ParamsTable
                rows={headersRows}
                setRows={setHeadersRows}
                allowAddMore
                showTypeColumn={false}
              />
            </section>
          )
        case "authorization":
          return <AuthorizationTab auth={auth} setAuth={setAuth} />
      }
    })()
    return (
      <ResizablePanelGroup
        orientation="vertical"
        className={panelGroupClass}
        {...resizableProps}
      >
        <ResizablePanel id="top" defaultSize={50} minSize={20} className="flex min-h-0 flex-col overflow-hidden p-2">
          <div className="min-h-0 flex-1 overflow-auto">
            {inner}
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel id="bottom" defaultSize={50} minSize={20} className="flex min-h-0 flex-col overflow-hidden">
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-auto">
            {responsePanel}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    )
  }

  return (
    <Tabs
      value={activeTab}
      onValueChange={(v) => onTabChange(v as ApiTabValue)}
      className="flex min-h-0 flex-1 flex-col overflow-hidden"
    >
      <TabsList className="h-9 w-full justify-start rounded-none border-b border-border bg-transparent p-0 px-4">
        {visibleTabs.map((tab) => (
          <TabsTrigger key={tab.id} value={tab.id} className={TAB_CLASS}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {visibleTabs.map((tab) => (
        <TabsContent key={tab.id} value={tab.id} className={contentClass}>
          {renderTabContent(tab.id)}
        </TabsContent>
      ))}
    </Tabs>
  )
}
