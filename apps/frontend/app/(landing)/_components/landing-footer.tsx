import Link from "next/link";
import { BookOpenIcon, GithubIcon } from "lucide-react";
import Decorations from "@/components/ui/decorations";
import { LINKS, ROUTES } from "@/config/constants";

const currentYear = new Date().getFullYear();

const productLinks = [
  { href: ROUTES.docsDevelopers, label: "Get started" },
  { href: ROUTES.docs, label: "Documentation" },
  { href: LINKS.github, label: "GitHub", external: true },
];

const resourceLinks = [
  { href: ROUTES.docs, label: "Docs" },
  { href: ROUTES.docsContributing, label: "Contributing" },
  { href: LINKS.github, label: "Repository", external: true },
];

function FooterLink({
  href,
  label,
  external,
}: {
  href: string;
  label: string;
  external?: boolean;
}) {
  const className =
    "text-sm text-muted-foreground transition-colors hover:text-foreground";
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {label}
      </a>
    );
  }
  return <Link href={href} className={className}>{label}</Link>;
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string; external?: boolean }[];
}) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
        {title}
      </h3>
      <ul className="flex flex-col gap-2">
        {links.map(({ href, label, external }) => (
          <li key={label}>
            <FooterLink href={href} label={label} external={external} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function LandingFooter() {
  return (
    <footer className="section border-t-0">
      <div className="section-content relative border p-6 sm:p-8">
        <Decorations />
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-3 sm:col-span-2 lg:col-span-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Tracelet
            </p>
            <p className="max-w-xs text-sm text-muted-foreground">
              Runtime API observability for Express. Documentation and request/response logs from your running app.
            </p>
          </div>
          <FooterColumn title="Product" links={productLinks} />
          <FooterColumn title="Resources" links={resourceLinks} />
        </div>
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © {currentYear} Tracelet. All rights reserved.
          </p>
          <nav className="flex items-center gap-6 text-sm" aria-label="Footer links">
            <Link
              href={ROUTES.docs}
              className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
            >
              <BookOpenIcon className="size-4" />
              Docs
            </Link>
            <a
              href={LINKS.github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
            >
              <GithubIcon className="size-4" />
              GitHub
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
