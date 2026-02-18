/**
 * Auth feature config (env, base URL, etc.)
 * Use empty string to hit same origin so Next.js rewrites proxy /api/auth and /api/organizations to the backend.
 * Set NEXT_PUBLIC_BACKEND_URL to the backend origin to call the backend directly (e.g. in production with separate host).
 */
export const authConfig = {
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL ?? "",
} as const;
