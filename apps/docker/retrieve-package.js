import { distDir } from "@home-assistant-matter-hub/build-utils";
import * as fs from "node:fs";
import * as path from "node:path";

const packageDist = distDir("home-assistant-matter-hub");
const filename = fs
  .readFileSync(path.join(packageDist, "package-name.txt"), "utf-8")
  .trim();

const packagePath = path.join(packageDist, filename);
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
