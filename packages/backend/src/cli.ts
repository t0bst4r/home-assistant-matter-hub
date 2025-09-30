#!/usr/bin/env node
import "./bootstrap.js";
import "./polyfills.js";
import * as path from "node:path";
import * as url from "node:url";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import start from "./commands/start/start-command.js";

const dirname =
  import.meta.dirname ?? url.fileURLToPath(new URL(".", import.meta.url));

export async function cli(argv: string[]): Promise<void> {
  const webDist =
    process.env.NODE_ENV === "development"
      ? undefined
      : path.join(dirname, "../frontend");
  const cli = yargs(hideBin(argv));
  cli
    .env("HAMH_")
    .scriptName("home-assistant-matter-hub")
    .version()
    .strict()
    .recommendCommands()
    .detectLocale(false)
    .help()
    .command(start(webDist))
    .demandCommand()
    .wrap(Math.min(140, cli.terminalWidth()))
    .parse();
}

await cli(process.argv);
