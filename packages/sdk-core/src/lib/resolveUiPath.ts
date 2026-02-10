import { createRequire } from "module";
import fs from "fs";
import path from "path";

const requireResolve = createRequire(path.join(__dirname, "resolveUiPath.js"));

/**
 * Resolve the default path to the Tracelet UI (directory containing index.html and assets).
 * Tries require("@tracelet/ui"), then package.json location, then monorepo fallbacks.
 * Use this from framework SDKs (e.g. Express) when uiPath is not provided.
 */
export function resolveDefaultUiPath(): string {
  const searchPaths = [
    process.cwd(),
    __dirname,
    path.join(__dirname, ".."),
    path.join(__dirname, "../../.."),
  ];
  try {
    const mainPath = require.resolve("@tracelet/ui", { paths: searchPaths });
    const distPath = path.dirname(mainPath);
    if (fs.existsSync(path.join(distPath, "index.html"))) return distPath;
    const distFromPkg = path.join(distPath, "..", "dist");
    if (fs.existsSync(path.join(distFromPkg, "index.html"))) return distFromPkg;
    return distPath;
  } catch {
    try {
      const pkgPath = requireResolve.resolve("@tracelet/ui/package.json", {
        paths: searchPaths,
      });
      const distPath = path.join(path.dirname(pkgPath), "dist");
      if (fs.existsSync(path.join(distPath, "index.html"))) return distPath;
      return distPath;
    } catch (e) {
      console.error("Tracelet UI package path not found.", e);
      const fromDist = path.join(__dirname, "../../../packages/sdk-ui/dist");
      const fromCwd = path.join(process.cwd(), "packages/sdk-ui/dist");
      if (fs.existsSync(path.join(fromDist, "index.html"))) return fromDist;
      if (fs.existsSync(path.join(fromCwd, "index.html"))) return fromCwd;
      return fromDist;
    }
  }
}
