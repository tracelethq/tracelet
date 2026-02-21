import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { APP_ROUTES } from "@/lib/constant";

export default function GetStartedPage() {
  return (
    <div className="p-4">
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Get started</CardTitle>
          <CardDescription>
            Create a project to connect your API and start viewing logs and API docs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href={APP_ROUTES.projects.route}>Go to projects</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
