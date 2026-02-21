/**
 * Runtime constants for the Tracelet UI. Injected via window.tracelet.constants in index.html
 * (e.g. replaced by Express SDK). Use getConstants() in components to read them.
 */
export interface TraceletConstants {
  /** Base path where the UI is mounted (e.g. "/tracelet-docs") */
  basePath: string;
  /** Page title */
  title: string;
}

declare global {
  interface Window {
    tracelet?: {
      constants: Partial<TraceletConstants>;
    };
  }
}

export const DEFAULT_CONSTANTS: TraceletConstants = {
  basePath: "/tracelet-docs",
  title: "Tracelet Docs"
};

/**
 * Returns the current constants (from window.tracelet.constants with defaults merged).
 * Use this in components instead of reading window.tracelet.constants directly.
 */
export function getConstants(): TraceletConstants {
  const w = typeof window !== "undefined" ? window : undefined;
  const injected = w?.tracelet?.constants ?? {};
  return {
    basePath: injected.basePath ?? DEFAULT_CONSTANTS.basePath,
    title: injected.title ?? DEFAULT_CONSTANTS.title,
  };
}
