"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchApiExplorer } from "./api";

export function useApiExplorerQuery(
  organizationId: string | undefined,
  env: string
) {
  return useQuery({
    queryKey: ["api-explorer", organizationId, env],
    queryFn: () =>
      organizationId
        ? fetchApiExplorer(organizationId, env)
        : Promise.reject(new Error("No org")),
    enabled: !!organizationId,
  });
}
