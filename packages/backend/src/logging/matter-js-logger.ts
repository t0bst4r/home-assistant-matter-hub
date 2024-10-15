import { Logger } from "winston";
import { Level } from "@project-chip/matter.js/log";
import stripColor from "strip-color";
import { createChildLogger } from "./create-child-logger.js";

export function matterJsLogger(
  logger: Logger,
): (level: Level, formattedLog: string) => void {
  return (enumLevel: Level, formattedLog: string) => {
    formattedLog = stripColor(formattedLog);

    const service = formattedLog.substring(31, 52).trim();
    const message = formattedLog.substring(52);

    if (
      service === "ExchangeManager" &&
      message.startsWith("Cannot find a session for ID ")
    ) {
      enumLevel = Level.DEBUG;
    }

    const level = enumToLevel[enumLevel];
    const log = createChildLogger(logger, service);
    log.log(level, message);
  };
}

const enumToLevel: Record<Level, string> = {
  [Level.DEBUG]: "debug",
  [Level.NOTICE]: "info",
  [Level.INFO]: "info",
  [Level.WARN]: "warn",
  [Level.ERROR]: "error",
  [Level.FATAL]: "error",
};
