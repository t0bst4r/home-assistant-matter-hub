import esbuild from "esbuild";
import tsc from "typescript";
import path from "node:path";
import externalizeAllPackagesExcept from "esbuild-plugin-noexternal";

import fs from "node:fs";
import { rimraf } from "rimraf";
import { doNotBundleFile } from "@home-assistant-matter-hub/build-utils";

const src = path.resolve(import.meta.dirname, "src");
const dist = path.resolve(import.meta.dirname, "dist");
const tsconfig = JSON.parse(fs.readFileSync("./tsconfig.json", "utf8"));

await rimraf(dist);
await buildBackend();

async function buildBackend() {
  process.stdout.write("Building Backend... ");
  await esbuild.build({
    bundle: true,
    entryPoints: [path.resolve(src, "cli.ts")],
    platform: "node",
    outdir: path.resolve(dist),
    treeShaking: true,
    target: "node20",
    format: "esm",
    minify: false,
    sourcemap: "linked",
    plugins: [
      externalizeAllPackagesExcept(["@home-assistant-matter-hub/common"]),
      doNotBundleFile(src, ["bootstrap.js"]),
    ],
  });

  const bootstrapFile = tsc.transpile(
    fs.readFileSync(path.resolve(src, "bootstrap.ts"), "utf-8"),
    tsconfig.compilerOptions,
    "bootstrap.mts",
  );
  fs.writeFileSync(path.resolve(dist, "bootstrap.js"), bootstrapFile);
  process.stdout.write("Done\n");
}
