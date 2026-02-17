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

export type CreateProjectInput = {
  organizationId: string;
  name: string;
  slug: string;
};

export async function createProject(input: CreateProjectInput): Promise<Project> {
  const res = await fetch(`${API_BASE}/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const message = typeof data?.error === "string" ? data.error : "Failed to create project";
    throw new Error(message);
  }
  return res.json();
}
