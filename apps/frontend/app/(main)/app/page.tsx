import { APP_ROUTES } from "@/lib/constant";
import { redirect } from "next/navigation";

/** /app root → get-started. */
export default function AppPage() {
  console.log("AppPage");
  redirect(APP_ROUTES.projects.route);
}