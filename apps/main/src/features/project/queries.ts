"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "@/features/auth";
import { fetchProjects } from "./api";

export function useProjectsQuery() {
  const { data: sessionData } = useSession();
  const hasSession = !!sessionData?.user;

  return useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
    enabled: hasSession,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });
}
