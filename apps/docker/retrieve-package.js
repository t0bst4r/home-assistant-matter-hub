import * as fs from "node:fs";
import * as path from "node:path";
import { distDir } from "@home-assistant-matter-hub/build-utils";

const packageJsonPath = import.meta.resolve(
  "home-assistant-matter-hub/package.json",
);
const packageDist = distDir(packageJsonPath);
const filename = fs
  .readFileSync(path.join(packageDist, "package-name.txt"), "utf-8")
  .trim();

const packagePath = filename.startsWith("/")
  ? filename
  : path.join(packageDist, filename);
const destinationAddon = path.join(import.meta.dirname, "addon", "package.tgz");
const destinationStandalone = path.join(
  import.meta.dirname,
  "standalone",
  "package.tgz",
);

fs.copyFileSync(packagePath, destinationAddon);
console.log(`Copied ${packagePath} to ${destinationAddon}`);

fs.copyFileSync(packagePath, destinationStandalone);
console.log(`Copied ${packagePath} to ${destinationStandalone}`);
