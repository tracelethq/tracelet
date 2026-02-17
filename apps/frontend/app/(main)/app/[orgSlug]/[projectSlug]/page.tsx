import { redirect } from "next/navigation";

/**
 * /app/[orgSlug]/[projectSlug] with no env segment → redirect to [projectSlug]/development.
 */
export default async function OrgProjectSlugPage({
  params,
}: {
  params: Promise<{ orgSlug: string; projectSlug: string }>;
}) {
  const { orgSlug, projectSlug } = await params;
  redirect(`/app/${orgSlug}/${projectSlug}/development`);
}
