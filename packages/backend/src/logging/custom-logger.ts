import { createLogger as createWinstonLogger, Logger } from "winston";
import { Logger as MatterLogger } from "@matter/general";
import { consoleTransport } from "./console-transport.js";
import { matterJsLogger } from "./matter-js-logger.js";
import { LogFormat } from "@matter/main";

const logger = createWinstonLogger({
  transports: [consoleTransport],
});

export const customLogger = {
  logger,
  configure(level: string, useColors: boolean) {
    logger.level = level;
    logger.defaultMeta = logger.defaultMeta ?? {};
    logger.defaultMeta.colorize = useColors;

    MatterLogger.level = "debug";
    MatterLogger.format = LogFormat.PLAIN;
    MatterLogger.log = matterJsLogger(createChildLogger(logger, "Matter"));
  },
};

export function createChildLogger(baseLogger: Logger, name: string): Logger {
  const logger = baseLogger.child({ loggerName: name });
  logger.defaultMeta = { ...baseLogger.defaultMeta, loggerName: name };
  return logger;
}
