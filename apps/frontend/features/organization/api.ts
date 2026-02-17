"use client";

import { authConfig } from "@/features/auth/config";
import type { Org } from "./store";

const API_BASE = `${authConfig.baseURL}/api`;

export async function fetchOrganizations(): Promise<Org[]> {
  const res = await fetch(`${API_BASE}/organizations`, {
    credentials: "include",
  });
  if (!res.ok) {
    if (res.status === 401) return [];
    throw new Error("Failed to fetch organizations");
  }
  return res.json();
}
