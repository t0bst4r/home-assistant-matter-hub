import esbuild from "esbuild";
import path from "node:path";
import { rimraf } from "rimraf";
import externalizeAllPackagesExcept from "esbuild-plugin-noexternal";

const src = path.resolve(import.meta.dirname, "src");
const dist = path.resolve(import.meta.dirname, "dist");

await rimraf(dist);
await buildBackend();

async function buildBackend() {
  process.stdout.write("Build Backend... ");
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
    ],
  });
  process.stdout.write("Done\n");
}
