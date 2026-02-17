
/**
 * Projects list for an org: /app/[orgSlug]/projects.
 * Org is selected; no project selected. Sync hook keeps URL and store in sync.
 */
export default function OrgProjectsPage() {
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">Projects</h1>
      <p className="text-muted-foreground mt-2">Select or create a project.</p>
    </div>
  );
}
