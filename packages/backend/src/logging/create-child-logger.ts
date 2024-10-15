import { Logger } from "winston";

export function createChildLogger(logger: Logger, name: string): Logger {
  const loggerName = [logger.defaultMeta?.loggerName, name]
    .filter((it) => !!it)
    .join(" / ");
  const log = logger.child({ loggerName });
  log.defaultMeta = { ...logger.defaultMeta, loggerName };
  return log;
}
