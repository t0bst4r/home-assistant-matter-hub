import * as path from "node:path";
import * as fs from "node:fs";
import { fileURLToPath } from "node:url";

import { rimraf } from "rimraf";

const dist = path.resolve(import.meta.dirname, "dist");

await rimraf(dist);

await copyDist(
  distDir("@home-assistant-matter-hub/frontend"),
  path.join(dist, "frontend"),
);

await copyDist(
  distDir("@home-assistant-matter-hub/backend"),
  path.join(dist, "backend"),
);

function distDir(pkgName) {
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

async function copyDist(source, destination) {
  process.stdout.write(
    `Copy ${path.relative(import.meta.dirname, source)} to ${path.relative(import.meta.dirname, destination)}... `,
  );
  fs.cpSync(source, destination, {
    recursive: true,
  });
  process.stdout.write("Done\n");
}
