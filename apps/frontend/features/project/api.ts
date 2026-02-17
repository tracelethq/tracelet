"use client";

import { authConfig } from "@/features/auth/config";
import type { Project } from "./store";

const API_BASE = `${authConfig.baseURL}/api`;

export async function fetchProjects(organizationId: string): Promise<Project[]> {
  if (!organizationId) return [];
  const res = await fetch(`${API_BASE}/projects?organizationId=${encodeURIComponent(organizationId)}`, {
    credentials: "include",
  });
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) return [];
    throw new Error("Failed to fetch projects");
  }
  return res.json();
}
