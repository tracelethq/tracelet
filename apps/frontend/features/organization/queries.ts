"use client";

import { useLayoutEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { fetchOrganizations } from "./api";
import { useOrganizationStore } from "./store";

export function useOrganizationsQuery() {
  const setOrgs = useOrganizationStore((s) => s.setOrgs);
  const query = useQuery({
    queryKey: ["organizations"],
    queryFn: fetchOrganizations,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });

  useLayoutEffect(() => {
    if (query.data != null) setOrgs(query.data);
  }, [query.data, setOrgs]);

  return query;
}

