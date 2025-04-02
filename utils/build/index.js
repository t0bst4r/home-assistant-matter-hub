import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export function distDir(packageJsonPath) {
  const packagePath = fileURLToPath(import.meta.resolve(packageJsonPath));
  const packageJson = JSON.parse(
    fs.readFileSync(packagePath, { encoding: "utf8" }),
  );
  if (!packageJson.destination) {
    console.error(`Destination directory not found for ${packageJsonPath}`);
    process.exit(1);
  }
  return path.join(path.dirname(packagePath), packageJson.destination);
}

/**
 * esbuild plugin to prevent packages from being bundled
 * @param {string} sourcesRoot
 * @param {string[]} files
 * @returns import("esbuild").Plugin
 */
export function doNotBundleFile(sourcesRoot, files) {
  return {
    name: "doNotBundleFile",
    setup(build) {
      build.onResolve({ filter: /^\..*$/ }, (args) => {
        if (args.kind !== "import-statement" || !args.path.startsWith(".")) {
          return;
        }
        const filePath = path.resolve(args.resolveDir, args.path);
        const relativePath = path.relative(sourcesRoot, filePath);
        if (!files.includes(relativePath)) {
          return;
        }
        return { path: args.path, external: true };
      });
    },
  };
}
