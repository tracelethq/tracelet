import { getDocSlugs } from "@/lib/docs-mdx";
import { LandingHeader } from "./_components/landing-header";

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let mdxDocs: { slug: string[]; href: string; title: string }[] = []
  try {
    mdxDocs = getDocSlugs()
  } catch {
    // content dir may be missing at build time
  }
  return (
    <div className="h-svh max-w-svw flex flex-col bg-background text-foreground px-4 sm:px-8 relative overflow-y-auto overflow-x-hidden">
      <LandingHeader mdxDocs={mdxDocs} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
