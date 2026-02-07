import { redirect } from "next/navigation"
import { DOCS_DEFAULT_SDK_ROUTE, ROUTES } from "@/config/constants"
import { DocPageToc } from "../../_components/doc-page-toc"
import { UsingDocsContent } from "../_components/using-docs-content"
import type { SdkChoice } from "../../_components/sdk-context"

const sections = [
  { id: "install", label: "Install" },
  { id: "use-in-code", label: "Use in code" },
  { id: "running-locally", label: "Running locally" },
  { id: "troubleshooting", label: "Troubleshooting" },
]

export default async function UsingSdkDocsPage({
  params,
}: {
  params: Promise<{ sdk: string }>
}) {
  const { sdk: raw } = await params
  if (raw !== "express" && raw !== "core") {
    redirect(DOCS_DEFAULT_SDK_ROUTE)
  }
  const sdk: SdkChoice = raw

  return (
    <>
      <article className="min-w-0 flex-1">
        <UsingDocsContent sdk={sdk} />
      </article>
      <DocPageToc sections={sections} />
    </>
  )
}
