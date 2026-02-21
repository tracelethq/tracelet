"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { fetchDashboardStats, refreshDashboardStats } from "./api";

export function useDashboardQuery(organizationId: string | undefined, env: string) {
  return useQuery({
    queryKey: ["dashboard", organizationId, env],
    queryFn: () =>
      organizationId
        ? fetchDashboardStats(organizationId, env)
        : Promise.reject(new Error("No org")),
    enabled: !!organizationId,
  });
}

export function useDashboardRefresh(
  organizationId: string | undefined,
  env: string
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      organizationId
        ? refreshDashboardStats(organizationId, env)
        : Promise.reject(new Error("No org")),
    onSuccess: (data, _variables, _context) => {
      if (organizationId)
        queryClient.setQueryData(["dashboard", organizationId, env], data);
    },
  });
}
