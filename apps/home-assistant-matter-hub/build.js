import * as fs from "node:fs";
import * as path from "node:path";

import { distDir } from "@home-assistant-matter-hub/build-utils";
import { rimraf } from "rimraf";

const frontendPackageJsonPath = import.meta.resolve(
  "@home-assistant-matter-hub/frontend/package.json",
);
const backendPackageJsonPath = import.meta.resolve(
  "@home-assistant-matter-hub/backend/package.json",
);

const dist = path.resolve(import.meta.dirname, "dist");

await rimraf(dist);

await copyDist(distDir(frontendPackageJsonPath), path.join(dist, "frontend"));

await copyDist(
  distDir(backendPackageJsonPath),
  path.join(dist, "backend"),
  250_000,
  600_000,
);

await copyFile(
  path.join(import.meta.dirname, "../../README.md"),
  path.join(import.meta.dirname, "README.md"),
);
await copyFile(
  path.join(import.meta.dirname, "../../LICENSE"),
  path.join(import.meta.dirname, "LICENSE"),
);

async function copyDist(source, destination, minSize, maxSize) {
  process.stdout.write(
    `Copy ${path.relative(import.meta.dirname, source)} to ${path.relative(import.meta.dirname, destination)}... `,
  );
  const sourceSize = getDirSize(source);
  if (minSize !== undefined && sourceSize < minSize) {
    throw new Error(`${sourceSize} does not satisfy min size (${minSize})`);
  }
  if (maxSize !== undefined && sourceSize > maxSize) {
    throw new Error(`${sourceSize} does not satisfy max size (${maxSize})`);
  }

  fs.cpSync(source, destination, {
    recursive: true,
  });
  process.stdout.write("Done\n");
}

async function copyFile(source, destination) {
  process.stdout.write(
    `Copy ${path.relative(import.meta.dirname, source)} to ${path.relative(import.meta.dirname, destination)}... `,
  );
  fs.cpSync(source, destination);
  process.stdout.write("Done\n");
}

function getDirSize(dirPath) {
  let size = 0;
  const files = fs.readdirSync(dirPath);

  for (let i = 0; i < files.length; i++) {
    const filePath = path.join(dirPath, files[i]);
    const stats = fs.statSync(filePath);

    if (stats.isFile()) {
      size += stats.size;
    } else if (stats.isDirectory()) {
      size += getDirSize(filePath);
    }
  }

  return size;
}
