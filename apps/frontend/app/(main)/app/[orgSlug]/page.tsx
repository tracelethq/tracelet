import { APP_ROUTES } from "@/lib/constant";
import { redirect } from "next/navigation";

const OrgSlugPage = async({params}: {params: Promise<{orgSlug: string}>}) => {
    const {orgSlug} = await params;
    redirect(`${APP_ROUTES.base}/${orgSlug}/projects`);
}

export default OrgSlugPage