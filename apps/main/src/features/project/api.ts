"use client";

import { authConfig } from "@/features/auth/config";

export type Project = {
  id: string;
  name: string;
  slug: string;
  createdAt?: string;
  memberCount?: number;
};

const API_BASE = `${authConfig.baseURL}/api`;

export async function fetchProjects(): Promise<Project[]> {
  const res = await fetch(`${API_BASE}/organizations`, { credentials: "include" });
  if (!res.ok) {
    if (res.status === 401) return [];
    throw new Error("Failed to fetch projects");
  }
  return res.json();
}
