/**
 * Project feature public API.
 * Use this for app-level imports: @/features/project
 */
export { ProjectSwitcher } from "./components/project-switcher";
export {
  APP_BASE_PATH,
  getAppOrgProjectPath,
  getAppProjectPath,
  parseOrgProjectEnvFromPath,
  parseProjectEnvFromPath,
} from "./constants";
export { useProjectStore, ENV_OPTIONS, type EnvId, type Project } from "./store";
