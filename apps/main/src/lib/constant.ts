const APP_ROUTES = {
  base: { route: "/", label: "Overview" },
  projects: { route: "/projects", label: "Projects" },
  profile: { route: "/profile", label: "Profile" },
  getStarted: { route: "/get-started", label: "Get Started" },
} as const;

export { APP_ROUTES };
