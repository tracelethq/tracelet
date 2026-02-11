"use client"

import * as React from "react"
import Link from "next/link"
import { MDXRemote, type MDXRemoteSerializeResult } from "next-mdx-remote"
import { BookOpenIcon, Code2Icon, BoxIcon, LampDesk, FlaskConicalIcon, FileTextIcon, FileBracesCornerIcon, FingerprintIcon, HeadingIcon } from "lucide-react"
import { CodeBlock } from "@/components/code-block"
import { ExpressIcon } from "@/components/icons/express-icon"
import { cn } from "@/lib/utils"

type CodeProps = { className?: string; children?: React.ReactNode }


export function getIconForMeta(icon: string="book"): React.ComponentType<{ className?: string }> {
  const icons:Record<string, React.ComponentType<{ className?: string }>> = {
    book: BookOpenIcon,
    express: ExpressIcon,
    box: BoxIcon,
    code: Code2Icon,
    lamp: LampDesk,
    flask: FlaskConicalIcon,
    introduction: BookOpenIcon,
    developer: Code2Icon,
    "api-explorer": FlaskConicalIcon,
    sdk: BoxIcon,
    "sdk-express": ExpressIcon,
    "sdk-core": BoxIcon,
    "sdk-python": FlaskConicalIcon,
    "sdk-java": Code2Icon,
    file: FileTextIcon,
    core: BoxIcon,
    bracesFile: FileBracesCornerIcon,
    header: HeadingIcon,
    auth: FingerprintIcon,
  }

  return icons[icon] ?? <></>
}

function slugifyHeading(children: React.ReactNode): string {
  const text = typeof children === "string"
    ? children
    : Array.isArray(children)
      ? children.map(slugifyHeading).join("")
      : React.isValidElement(children) && (children.props as { children?: React.ReactNode }).children != null
        ? slugifyHeading((children.props as { children: React.ReactNode }).children)
        : ""
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "section"
}

/** Code block with npm / yarn / pnpm tabs for use in MDX. */
function CodeBlockTabs({
  npm,
  yarn,
  pnpm,
  language = "bash",
  className,
}: {
  npm?: string
  yarn?: string
  pnpm?: string
  language?: string
  className?: string
}) {
  const tabs =
    npm || yarn || pnpm
      ? {
          ...(npm && { npm }),
          ...(yarn && { yarn }),
          ...(pnpm && { pnpm }),
        }
      : undefined
  return (
    <CodeBlock
      tabs={tabs}
      language={language}
      className={cn("my-4", className)}
    />
  )
}

function DocCardGrid({ children }: { children?: React.ReactNode }) {
  return <div className="mt-12 grid gap-6 sm:grid-cols-2">{children}</div>
}

function DocCard({
  href,
  title,
  description,
  icon = "code",
}: {
  href: string
  title: string
  description: string
  icon?: string
}) {
  const icons:Record<string, React.ComponentType<{ className?: string }>> = {
    book: BookOpenIcon,
    express: ExpressIcon,
    box: BoxIcon,
    code: Code2Icon,
    lamp: LampDesk,
    flask: FlaskConicalIcon,
  }
  const Icon = icons[icon]
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-lg border border-border bg-card p-6 text-left transition-colors hover:border-primary/50 hover:bg-muted/30"
    >
      <div className="flex items-center gap-3">
        <div className="rounded-md bg-primary/10 p-2">
          <Icon className="size-5 text-primary" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{description}</p>
      <span className="mt-4 text-sm font-medium text-primary group-hover:underline">
        View →
      </span>
    </Link>
  )
}

const components = {
  DocCardGrid,
  DocCard,
  CodeBlockTabs,
  pre: (props: React.ComponentProps<"pre">) => {
    let code = ""
    let language = "text"
    const raw = props.children
    const child = React.isValidElement(raw) ? raw : null
    if (child && typeof child.props === "object" && child.props !== null) {
      const p = child.props as CodeProps
      const className = p?.className ?? ""
      const match = /language-(\w+)/.exec(String(className))
      if (match) language = match[1]
      if (p?.children != null) code = String(p.children).trim()
    }
    // Fallback: get text from any children
    if (!code && props.children != null) {
      const flatten = (node: React.ReactNode): string => {
        if (typeof node === "string") return node
        if (Array.isArray(node)) return node.map(flatten).join("")
        if (React.isValidElement(node)) {
          const next = (node.props as { children?: React.ReactNode }).children
          if (next != null) return flatten(next)
        }
        return ""
      }
      code = flatten(props.children).trim()
    }
    if (code) {
      return (
        <CodeBlock
          code={code}
          language={language}
          className="my-4"
        />
      )
    }
    return <pre {...props} />
  },
  code: (props: React.ComponentProps<"code">) => (
    <code
      className={cn("rounded bg-muted px-1 py-0.5 font-mono text-sm", props.className)}
      {...props}
    />
  ),
  h2: (props: React.ComponentProps<"h2">) => {
    const id = props.id ?? slugifyHeading(props.children)
    return (
      <h2
        {...props}
        id={id}
        className="scroll-mt-24 border-b border-border pb-2 text-xl font-semibold tracking-tight text-foreground mt-10 mb-4 first:mt-0"
      />
    )
  },
  h3: (props: React.ComponentProps<"h3">) => {
    const id = props.id ?? slugifyHeading(props.children)
    return (
      <h3 {...props} id={id} className="font-semibold text-foreground mt-6 mb-2" />
    )
  },
  p: (props: React.ComponentProps<"p">) => (
    <p className="mb-4 text-muted-foreground text-sm leading-relaxed" {...props} />
  ),
  ul: (props: React.ComponentProps<"ul">) => (
    <ul className="list-disc pl-5 space-y-1 mb-4 text-muted-foreground" {...props} />
  ),
  ol: (props: React.ComponentProps<"ol">) => (
    <ol className="list-decimal pl-5 space-y-1 mb-4 text-muted-foreground" {...props} />
  ),
  li: (props: React.ComponentProps<"li">) => (
    <li className="[&>strong]:text-foreground" {...props} />
  ),
  a: (props: React.ComponentProps<"a">) => (
    <a className="text-primary hover:underline" {...props} />
  ),
  table: (props: React.ComponentProps<"table">) => (
    <div className="my-6 w-full overflow-x-auto rounded-md border border-border">
      <table className="w-full border-collapse text-sm" {...props} />
    </div>
  ),
  thead: (props: React.ComponentProps<"thead">) => (
    <thead className="bg-muted/50 [&>tr:first-child>th:first-child]:rounded-tl-md [&>tr:first-child>th:last-child]:rounded-tr-md" {...props} />
  ),
  tbody: (props: React.ComponentProps<"tbody">) => (
    <tbody className="[&>tr:last-child>td:first-child]:rounded-bl-md [&>tr:last-child>td:last-child]:rounded-br-md" {...props} />
  ),
  tr: (props: React.ComponentProps<"tr">) => (
    <tr className="border-b border-border last:border-b-0" {...props} />
  ),
  th: (props: React.ComponentProps<"th">) => (
    <th
      className="border-r border-border px-4 py-2 text-left font-semibold text-foreground last:border-r-0 last:min-w-48"
      {...props}
    />
  ),
  td: (props: React.ComponentProps<"td">) => (
    <td
      className="border-r border-border px-4 py-3 text-muted-foreground last:border-r-0 last:min-w-56 last:max-w-xl"
      {...props}
    />
  ),
}

type MdxRendererProps = {
  source: MDXRemoteSerializeResult
}

export function MdxRenderer({ source }: MdxRendererProps) {
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
      <div className="prose prose-neutral dark:prose-invert max-w-none animate-pulse">
        <div className="h-8 w-3/4 rounded bg-muted" />
        <div className="mt-4 h-4 w-full rounded bg-muted" />
        <div className="mt-2 h-4 w-full rounded bg-muted" />
      </div>
    )
  }

  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none">
      <MDXRemote {...source} components={components} />
    </div>
  )
}
