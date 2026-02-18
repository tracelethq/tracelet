import { create } from "zustand";

export const ENV_OPTIONS = [
  { id: "development", label: "Development", color: "bg-green-500" },
  { id: "staging", label: "Staging", color: "bg-yellow-500" },
  { id: "production", label: "Production", color: "bg-red-500" },
] as const;

export type EnvId = (typeof ENV_OPTIONS)[number]["id"];

export type Project = { id: string; name: string; slug: string };

type ProjectState = {
  projects: Project[];
  env: EnvId;
  selectedProjectId: string;
  setEnv: (env: EnvId) => void;
  setSelectedProjectId: (id: string) => void;
  setProjects: (projects: Project[]) => void;
  /** Set env and project from URL/searchParams. Uses defaults if invalid or missing. */
  hydrateFromUrl: (params: { env?: string | null; project?: string | null }) => void;
};

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  env: "development",
  selectedProjectId: "",
  setEnv: (env) => set({ env }),
  setSelectedProjectId: (id) => set({ selectedProjectId: id }),
  setProjects: (projects) => set({ projects }),
  hydrateFromUrl: (params) => {
    const { projects, env: currentEnv, selectedProjectId } = get();
    const firstProjectId = projects[0]?.id ?? null;

    let env = currentEnv;
    const envParam = params.env?.toLowerCase();
    if (envParam && ENV_OPTIONS.some((e) => e.id === envParam)) {
      env = envParam as EnvId;
    } else {
      env = "development";
    }

    let projectId = selectedProjectId;
    const projectParam = params.project;
    if (projectParam && projects.some((p) => p.id === projectParam)) {
      projectId = projectParam;
    } else if (firstProjectId) {
      projectId = firstProjectId;
    }

    set({ env, selectedProjectId: projectId });
  },
}));
