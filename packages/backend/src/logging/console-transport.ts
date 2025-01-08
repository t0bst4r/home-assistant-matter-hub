import chalk from "chalk";
import type { Format } from "logform";
import { format, transports } from "winston";

const colorPerLevel: Record<string, (str: string) => string> = {
  silly: (str) => chalk.green(str),
  debug: (str) => chalk.grey(str),
  info: (str) => str,
  warn: (str) => chalk.yellow(str),
  error: (str) => chalk.red(str),
};

const formatPrint: Format = format.printf((transformableInfo) => {
  const info = transformableInfo as Record<string, string>;
  const colorize = transformableInfo.colorize === true;
  const color =
    colorPerLevel[colorize ? info.level : "no-color"] ?? ((str: string) => str);

  return color(
    `[ ${info.timestamp} ] [ ${info.level.toUpperCase().padEnd(5, " ")} ] [ ${(info.loggerName ?? "").padEnd(50, " ").substring(0, 50)} ]: ${info.message}`,
  );
});

export const consoleTransport = new transports.Console({
  format: format.combine(
    format.errors({ stack: true }),
    format.timestamp({}),
    format.splat(),
    formatPrint,
  ),
});
