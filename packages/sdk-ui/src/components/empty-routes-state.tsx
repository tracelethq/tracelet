import { RouteIcon, BookOpenIcon, RefreshCwIcon } from "lucide-react"

import { getConstants } from "@/constants"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Button } from "@/components/ui/button"

interface EmptyRoutesStateProps {
  onRefresh?: () => void
}

export function EmptyRoutesState({ onRefresh }: EmptyRoutesStateProps) {
  const { basePath: apiUrl } = getConstants()

  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <RouteIcon />
        </EmptyMedia>
        <EmptyTitle>No routes found</EmptyTitle>
        <EmptyDescription>
          Your Express app hasn&apos;t exposed any routes yet, or Tracelet
          hasn&apos;t connected. Add routes to your app and ensure it&apos;s
          running with Tracelet middleware at {apiUrl}.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        {onRefresh && (
          <Button variant="outline" onClick={onRefresh}>
            <RefreshCwIcon className="size-4" />
            Refresh
          </Button>
        )}
        <Button variant="outline" asChild>
          <a
            href="https://github.com/onlydev/tracelet"
            target="_blank"
            rel="noopener noreferrer"
          >
            <BookOpenIcon className="size-4" />
            View setup guide
          </a>
        </Button>
      </EmptyContent>
    </Empty>
  )
}
