"use client";

import { authConfig } from "@/features/auth/config";
import type { DashboardStats } from "./types";

const API_BASE = `${authConfig.baseURL}/api`;

export async function fetchDashboardStats(
  organizationId: string,
  env: string
): Promise<DashboardStats> {
  const params = new URLSearchParams();
  params.set("env", env);

  const res = await fetch(
    `${API_BASE}/organizations/${encodeURIComponent(organizationId)}/dashboard?${params}`,
    { credentials: "include" }
  );
  if (!res.ok) {
    if (res.status === 401) throw new Error("Unauthorized");
    if (res.status === 404) throw new Error("Project not found");
    if (res.status >= 500) throw new Error("Internal server error");
    throw new Error("Internal server error");
  }
  return res.json();
}

export async function refreshDashboardStats(
  organizationId: string,
  env: string
): Promise<DashboardStats> {
  const params = new URLSearchParams();
  params.set("env", env);
  const res = await fetch(
    `${API_BASE}/organizations/${encodeURIComponent(organizationId)}/dashboard/refresh?${params}`,
    { method: "POST", credentials: "include" }
  );
  if (!res.ok) {
    if (res.status === 401) throw new Error("Unauthorized");
    if (res.status === 404) throw new Error("Project not found");
    if (res.status >= 500) throw new Error("Internal server error");
    throw new Error("Internal server error");
  }
  return res.json();
}
