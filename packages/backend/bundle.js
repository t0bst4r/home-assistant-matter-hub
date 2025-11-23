import fs from "node:fs";
import path from "node:path";
import esbuild from "esbuild";
import externalizeAllPackagesExcept from "esbuild-plugin-noexternal";
import { rimraf } from "rimraf";
import tsc from "typescript";

const src = path.resolve(import.meta.dirname, "src");
const dist = path.resolve(import.meta.dirname, "dist");
const tsconfig = JSON.parse(
  fs.readFileSync("./tsconfig.json", { encoding: "utf8" }),
);

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
    fs.readFileSync(path.resolve(src, "bootstrap.ts"), { encoding: "utf-8" }),
    tsconfig.compilerOptions,
    "bootstrap.mts",
  );
  fs.writeFileSync(path.resolve(dist, "bootstrap.js"), bootstrapFile);

  const stat = fs.statSync(path.resolve(dist, "cli.js"));
  process.stdout.write(`Done (${stat.size / 1024} KB)\n`);
}

function doNotBundleFile(sourcesRoot, files) {
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
