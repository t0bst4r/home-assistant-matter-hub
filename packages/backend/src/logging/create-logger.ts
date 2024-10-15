import {
  Logger,
  createLogger as createWinstonLogger,
  format,
  transports,
} from "winston";
import chalk from "chalk";
import type { Format } from "logform";

function formatPrint(colorize?: boolean): Format {
  return format.printf((info) => {
    const color =
      colorPerLevel[colorize ? info.level : "no-color"] ??
      ((str: string) => str);

    return color(
      `[ ${info.timestamp} ] [ ${info.level.toUpperCase().padEnd(5, " ")} ] [ ${(info.loggerName ?? "").padEnd(40, " ").substring(0, 40)} ]: ${info.message}`,
    );
  });
}

export function createLogger(level: string, disableColors: boolean): Logger {
  return createWinstonLogger({
    transports: [
      new transports.Console({
        level,
        format: format.combine(
          format.timestamp({}),
          format.splat(),
          formatPrint(!disableColors),
        ),
      }),
    ],
  });
}

const colorPerLevel: Record<string, (str: string) => string> = {
  debug: (str) => chalk.grey(str),
  info: (str) => str,
  warn: (str) => chalk.yellow(str),
  error: (str) => chalk.red(str),
};
