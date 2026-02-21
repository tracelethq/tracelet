"use client";

import { authConfig } from "@/features/auth/config";
import type { TraceletMeta } from "./types";

export type ApiExplorerResponse = {
  data: TraceletMeta[];
  updatedAt: string | null;
};

const API_BASE = `${authConfig.baseURL}/api`;

export async function fetchApiExplorer(
  organizationId: string,
  env: string
): Promise<ApiExplorerResponse> {
  const params = new URLSearchParams();
  params.set("env", env);

  const res = await fetch(
    `${API_BASE}/organizations/${encodeURIComponent(organizationId)}/api-explorer?${params}`,
    { credentials: "include" }
  );
  if (!res.ok) {
    if (res.status === 401) throw new Error("Unauthorized");
    if (res.status === 404) throw new Error("Project not found");
    throw new Error("Failed to fetch API explorer");
  }
  return res.json();
}
