import { fileURLToPath } from "node:url";
import fs from "node:fs";
import path from "node:path";

export function distDir(pkgName) {
  const packagePath = fileURLToPath(
    import.meta.resolve(`${pkgName}/package.json`),
  );
  const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));
  if (!packageJson.destination) {
    console.error(`Destination directory not found for ${pkgName}`);
    process.exit(1);
  }
  return path.join(path.dirname(packagePath), packageJson.destination);
}

export function fileInPackage(pkgName, filePath) {
  const packagePath = fileURLToPath(
    import.meta.resolve(`${pkgName}/package.json`),
  );
  return path.join(path.dirname(packagePath), filePath);
}

/**
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
