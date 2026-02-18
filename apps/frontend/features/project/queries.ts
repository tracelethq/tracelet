"use client";

import { useLayoutEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { useSession } from "@/features/auth";
import { fetchProjects } from "./api";
import { useProjectStore } from "./store";

export function useProjectsQuery() {
  const { data: sessionData } = useSession();
  const setProjects = useProjectStore((s) => s.setProjects);
  const hasSession = !!sessionData?.user;

  const query = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
    enabled: hasSession,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });

  useLayoutEffect(() => {
    if (query.data != null) setProjects(query.data);
  }, [query.data, setProjects]);

  return query;
}
