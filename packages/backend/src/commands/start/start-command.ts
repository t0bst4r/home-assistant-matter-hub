import "@matter/nodejs";
import type { CommandModule } from "yargs";
import { startHandler } from "./start-handler.js";
import { startOptionsBuilder } from "./start-options-builder.js";
import type { StartOptions } from "./start-options.js";

export default function startCommand(
  webDist?: string,
): CommandModule<{}, StartOptions> {
  return {
    command: "start",
    describe: "start the application",
    builder: startOptionsBuilder,
    handler: (args) => startHandler(args, webDist),
  };
}
