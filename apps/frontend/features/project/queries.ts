"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchProjects } from "./api";
import { useProjectStore } from "./store";

export function useProjectsQuery(organizationId: string) {
  const setProjects = useProjectStore((s) => s.setProjects);

  return useQuery({
    queryKey: ["projects", organizationId],
    queryFn: () => fetchProjects(organizationId),
    enabled: Boolean(organizationId),
    staleTime: 15_000,
    gcTime: 5 * 60_000,
    onSuccess: (data) => setProjects(data),
  });
}

