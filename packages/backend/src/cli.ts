#!/usr/bin/env node

const argv = [...process.argv];
process.argv.splice(0, process.argv.length);

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import * as path from "node:path";

export async function cli(argv: string[]): Promise<void> {
  const start = await import("./commands/start.js").then((m) => m.default);
  const webDist =
    process.env.NODE_ENV === "development"
      ? undefined
      : path.join(import.meta.dirname, "../frontend");
  yargs(hideBin(argv))
    .env("HAMH_")
    .scriptName("home-assistant-matter-hub")
    .version()
    .strict()
    .recommendCommands()
    .detectLocale(false)
    .help()
    .command(start(webDist))
    .demandCommand()
    .parse();
}

await cli(argv);
