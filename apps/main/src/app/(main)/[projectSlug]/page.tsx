import { redirect } from "next/navigation";
import { getAppProjectPath } from "@/features/project/constants";

export default async function ProjectSlugPage({ params }: { params: Promise<{ projectSlug: string }> }) {
  const { projectSlug } = await params;
  redirect(getAppProjectPath(projectSlug, "development"));
}
