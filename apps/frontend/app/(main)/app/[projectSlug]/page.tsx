import { redirect } from "next/navigation";

/** /app/[projectSlug] with no env → redirect to development. */
export default async function ProjectSlugPage({
  params,
}: {
  params: Promise<{ projectSlug: string }>;
}) {
  const { projectSlug } = await params;
  redirect(`/app/${projectSlug}/development`);
}
