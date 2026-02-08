type DocSectionProps = {
  id: string
  title: string
  children: React.ReactNode
}

export function DocSection({ id, title, children }: DocSectionProps) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="text-xl font-semibold tracking-tight text-foreground border-b border-border pb-2 mb-4">
        {title}
      </h2>
      <div className="prose prose-neutral dark:prose-invert max-w-none text-muted-foreground text-sm leading-relaxed">
        {children}
      </div>
    </section>
  )
}
