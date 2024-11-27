import "@matter/nodejs";
import { CommandModule } from "yargs";
import { StartOptions } from "./start-options.js";
import { startOptionsBuilder } from "./start-options-builder.js";
import { startHandler } from "./start-handler.js";

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
