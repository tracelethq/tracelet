import * as React from "react";
import { CopyIcon, Loader2Icon, SendIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { RouteMeta } from "@/types/route";
import Decorations from "../ui/decorations";

interface ApiDetailsHeaderProps {
  route: RouteMeta;
  onSend?: () => void;
  sendLoading?: boolean;
  /** Returns the current request as a cURL command. Used for Copy cURL. */
  getCurlRequest?: () => string;
  /** Resolved URL that will be used for the request (base + path + query). */
  fetchUrl?: string;
}

export function ApiDetailsHeader({
  route,
  onSend,
  sendLoading = false,
  getCurlRequest,
  fetchUrl,
}: ApiDetailsHeaderProps) {
  const [copiedCurl, setCopiedCurl] = React.useState(false);
  const method =
    typeof route.method === "string" ? route.method : String(route.method);
  const path = typeof route.path === "string" ? route.path || "/" : "/";

  const handleCopyCurl = React.useCallback(async () => {
    if (!getCurlRequest) return;
    const curl = getCurlRequest();
    try {
      await navigator.clipboard.writeText(curl);
      setCopiedCurl(true);
      setTimeout(() => setCopiedCurl(false), 2000);
    } catch {
      // ignore
    }
  }, [getCurlRequest]);

  return (
    <div className="shrink-0 border-b border-border p-px pr-[2px]">
      <div className="relative px-6 py-4">
        <Decorations />
        <div className="flex flex-wrap items-center justify-between gap-2 ">
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="font-mono text-xs">
                {method}
              </Badge>
              <code className="text-foreground font-mono text-sm font-medium">
                {path}
              </code>
            </div>
            {fetchUrl && (
              <code
                className="text-muted-foreground block truncate font-mono text-xs"
                title={fetchUrl}
              >
                {fetchUrl}
              </code>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {getCurlRequest && (
              <Button
                size="sm"
                variant="outline"
                className="h-8 gap-1.5 text-xs"
                onClick={handleCopyCurl}
                disabled={sendLoading}
              >
                <CopyIcon className="size-3.5" />
                {copiedCurl ? "Copied" : "Copy cURL"}
              </Button>
            )}
            {onSend && (
              <Button
                size="sm"
                variant="default"
                className="h-8 gap-1.5 text-xs"
                onClick={onSend}
                disabled={sendLoading}
              >
                {sendLoading ? (
                  <Loader2Icon className="size-3.5 animate-spin" />
                ) : (
                  <SendIcon className="size-3.5" />
                )}
                Send
              </Button>
            )}
          </div>
        </div>
        {route.description && typeof route.description === "string" && (
          <p className="text-muted-foreground mt-1.5 text-xs leading-relaxed">
            {route.description}
          </p>
        )}
      </div>
    </div>
  );
}
