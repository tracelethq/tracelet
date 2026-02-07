export function ResponsePlaceholder() {
  return (
    <section className="flex flex-1 flex-col overflow-hidden">
      <h3 className="text-muted-foreground mb-2 text-xs font-medium">
        Response
      </h3>
      <div className="bg-muted/30 flex flex-1 items-center justify-center rounded-md border border-dashed border-border p-8 text-center text-muted-foreground text-xs">
        Response will appear here
      </div>
    </section>
  )
}
