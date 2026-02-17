"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { fetchProjects } from "./api";
import { useProjectStore } from "./store";

export function useProjectsQuery(organizationId: string) {
  const setProjects = useProjectStore((s) => s.setProjects);
  const query = useQuery({
    queryKey: ["projects", organizationId],
    queryFn: () => fetchProjects(organizationId),
    enabled: Boolean(organizationId),
    staleTime: 15_000,
    gcTime: 5 * 60_000,
  });

  useEffect(() => {
    if (query.data != null) setProjects(query.data);
  }, [query.data, setProjects]);

  return query;
}

