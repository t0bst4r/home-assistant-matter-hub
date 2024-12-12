import { LogLevel } from "@matter/main";
import { Logger } from "winston";

const messageRegexp =
  /^(?<datetime>\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3}) (?<logLevel>\w+) (?<service>\w+) (?<message>.*)$/s;

export function matterJsLogger(
  logger: Logger,
): (level: LogLevel, formattedLog: string) => void {
  return (enumLevel: LogLevel, formattedLog: string) => {
    const match = messageRegexp.exec(formattedLog);

    if (!match) {
      logger.warn("Could not parse the following log message");
    }

    const service = match?.groups?.service ?? "Unknown";
    const message = match?.groups?.message ?? formattedLog;

    if (
      service === "ExchangeManager" &&
      message.startsWith("Cannot find a session for ID ")
    ) {
      enumLevel = LogLevel.DEBUG;
    }

    const level = enumToLevel[enumLevel];
    logger.log(level, message, {
      loggerName: `${logger.defaultMeta.loggerName} / ${service}`,
    });
  };
}

const enumToLevel: Record<LogLevel, string> = {
  [LogLevel.DEBUG]: "debug",
  [LogLevel.NOTICE]: "info",
  [LogLevel.INFO]: "info",
  [LogLevel.WARN]: "warn",
  [LogLevel.ERROR]: "error",
  [LogLevel.FATAL]: "error",
};
