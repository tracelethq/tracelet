/**
 * Auth feature config (env, base URL, etc.)
 */
export const authConfig = {
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3005",
} as const;
