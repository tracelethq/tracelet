const APP_ROUTES = {
  base: {route: "/app", label: "Overview"},
  projects: {route: "/app/projects", label: "Projects"},
  profile: {route: "/app/profile", label: "Profile"},
  getStarted: {route: "/app/get-started", label: "Get Started"},
} as const;

export { APP_ROUTES };