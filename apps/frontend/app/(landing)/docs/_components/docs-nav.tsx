"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpenIcon, Code2Icon, FileTextIcon, BoxIcon } from "lucide-react";
import { ExpressIcon } from "@/components/icons/express-icon";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/config/constants";

const navItems = [
  { href: ROUTES.docs, label: "Docs", icon: FileTextIcon },
  { href: ROUTES.docsUsing, label: "For developers", icon: Code2Icon },
  { href: ROUTES.docsContributing, label: "For contributors", icon: BookOpenIcon },
] as const;

const sdkItems = [
  { href: ROUTES.docsUsingExpress, label: "Express", icon: ExpressIcon },
  { href: ROUTES.docsUsingCore, label: "Core only", icon: BoxIcon },
] as const;

const navLinkClass =
  "flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors w-full text-left";

export function DocsNav() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 border-r border-border pr-6">
      <nav className="sticky top-20 space-y-6">
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Content
          </p>
          <ul className="space-y-0.5">
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive =
                href === ROUTES.docs ? pathname === ROUTES.docs : pathname === href;
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={cn(
                      navLinkClass,
                      isActive
                        ? "bg-primary/10 font-medium text-primary"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                    )}
                  >
                    <Icon className="size-4 shrink-0" />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            SDK
          </p>
          <ul className="space-y-0.5">
            {sdkItems.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={cn(
                      navLinkClass,
                      isActive
                        ? "bg-primary/10 font-medium text-primary"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                    )}
                  >
                    <Icon className="size-4 shrink-0" />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </aside>
  );
}
