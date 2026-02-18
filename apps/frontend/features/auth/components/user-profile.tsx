"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, User } from "lucide-react";

import { useSession, signOut } from "../lib/auth-client";
import { AUTH_ROUTES } from "../constants";
import { useProjectStore } from "@/features/project/store";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserProfile({ collapsed }: { collapsed: boolean }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data, isPending, error } = useSession();
  const user = data?.user;
  const setProjects = useProjectStore((s) => s.setProjects);
  const setSelectedProjectId = useProjectStore((s) => s.setSelectedProjectId);

  useEffect(() => {
    if (!isPending && error) {
      router.push(AUTH_ROUTES.signIn);
    }
  }, [isPending, error, router]);

  function handleSignOut() {
    queryClient.removeQueries({ queryKey: ["projects"] });
    signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push(AUTH_ROUTES.signIn);
        },
      },
    });
  }

  if (isPending || !user) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 rounded-md px-2 py-2",
          collapsed && "justify-center px-0",
        )}
      >
        <div className="size-8 shrink-0 animate-pulse rounded-full bg-sidebar-accent" />
        {!collapsed && (
          <div className="flex flex-1 flex-col gap-1">
            <div className="h-3 w-20 rounded bg-sidebar-accent" />
            <div className="h-2.5 w-28 rounded bg-sidebar-accent" />
          </div>
        )}
      </div>
    );
  }

  const name = user.name ?? "User";
  const email = user.email ?? "";
  const image = user.image ?? null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sidebar-foreground outline-none transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring",
            collapsed && "justify-center px-0",
          )}
          aria-label="User menu"
        >
          <span className="relative flex size-8 shrink-0 overflow-hidden rounded-full bg-sidebar-accent">
            {image ? (
              <img
                src={image}
                alt=""
                className="size-full object-cover"
              />
            ) : (
              <span className="flex size-full items-center justify-center text-xs font-medium text-sidebar-accent-foreground">
                {name.charAt(0).toUpperCase()}
              </span>
            )}
          </span>
          {!collapsed && (
            <span className="min-w-0 flex-1 truncate">
              <span className="block truncate text-sm font-medium">{name}</span>
              {email && (
                <span className="block truncate text-xs text-sidebar-foreground/80">
                  {email}
                </span>
              )}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="right" className="w-56">
        <DropdownMenuItem asChild>
          <Link href="/app/profile" className="gap-2">
            <User className="size-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSignOut} className="gap-2">
          <LogOut className="size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
