import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { rimraf } from "rimraf";

const projectRoot = path.join(import.meta.dirname, "../..");

const frontend = packageDir("@home-assistant-matter-hub/frontend", "dist");
const backend = packageDir("@home-assistant-matter-hub/backend", "dist");

const dist = path.resolve(import.meta.dirname, "dist");
await rimraf(dist);

fs.cpSync(frontend, path.join(dist, "frontend"), {
  recursive: true,
});
fs.cpSync(backend, path.join(dist, "backend"), {
  recursive: true,
});

fs.cpSync(
  path.join(projectRoot, "README.md"),
  path.join(import.meta.dirname, "README.md"),
);
fs.cpSync(
  path.join(projectRoot, "LICENSE"),
  path.join(import.meta.dirname, "LICENSE"),
);

/**
 * Resolve a directory in a package
 * @param {string} packageName The path of the package json
 * @param {string} directory The dist dir in the package
 * @returns {string}
 */
function packageDir(packageName, directory) {
  const packageJsonPath = fileURLToPath(
    import.meta.resolve(path.join(packageName, "package.json")),
  );
  const packagePath = path.dirname(packageJsonPath);
  return path.join(packagePath, directory);
}
