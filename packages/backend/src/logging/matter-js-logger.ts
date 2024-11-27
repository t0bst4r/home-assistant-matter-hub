import { LogLevel } from "@matter/main";
import stripColor from "strip-color";
import { Logger } from "winston";

export function matterJsLogger(
  logger: Logger,
): (level: LogLevel, formattedLog: string) => void {
  return (enumLevel: LogLevel, formattedLog: string) => {
    formattedLog = stripColor(formattedLog);

    const service = formattedLog.substring(31, 52).trim();
    const message = formattedLog.substring(52);

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
