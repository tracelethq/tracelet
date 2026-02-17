import { APP_ROUTES } from "@/lib/constant";
import { redirect } from "next/navigation";

/** /app root → get-started (org-scoped routes are under /app/[orgSlug]/...). */
export default function AppPage() {
  redirect(APP_ROUTES.getStarted);
}