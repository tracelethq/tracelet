import { FileJsonIcon } from "lucide-react"

export function ApiDetailsEmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center text-muted-foreground">
      <FileJsonIcon className="size-12 opacity-40" />
      <p className="text-sm font-medium">Select a route</p>
      <p className="text-xs">
        Choose an API endpoint from the list to view its details
      </p>
    </div>
  )
}
