"use client";

import { authConfig } from "@/features/auth/config";
import type { Project } from "./store";

const API_BASE = `${authConfig.baseURL}/api`;

/** Fetch all projects (organizations) the user is a member of. */
export async function fetchProjects(): Promise<Project[]> {
  const res = await fetch(`${API_BASE}/organizations`, {
    credentials: "include",
  });
  if (!res.ok) {
    if (res.status === 401) return [];
    throw new Error("Failed to fetch projects");
  }
  return res.json();
}
