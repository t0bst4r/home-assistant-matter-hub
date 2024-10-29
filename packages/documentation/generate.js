import path from "node:path";
import fs from "node:fs";

await copyFile(
  path.join(import.meta.dirname, "../../README.md"),
  path.join(import.meta.dirname, "generated/pages/About.md"),
);

async function copyFile(source, destination) {
  process.stdout.write(
    `Copy ${path.relative(import.meta.dirname, source)} to ${path.relative(import.meta.dirname, destination)}... `,
  );
  fs.cpSync(source, destination);
  process.stdout.write("Done\n");
}
