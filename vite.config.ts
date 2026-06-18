import { defineConfig } from "vite";
import { execSync } from "node:child_process";

/** Short commit hash: from CI env when available, else local git, else "dev". */
function commitHash(): string {
  if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA.slice(0, 7);
  try {
    return execSync("git rev-parse --short HEAD").toString().trim();
  } catch {
    return "dev";
  }
}

export default defineConfig({
  // Project is served from https://<user>.github.io/damia3d/ on GitHub Pages.
  base: "/damia3d/",
  define: {
    __COMMIT__: JSON.stringify(commitHash()),
  },
});
