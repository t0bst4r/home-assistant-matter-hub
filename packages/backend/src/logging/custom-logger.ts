import {
  createLogger as createWinstonLogger,
  format,
  transports,
} from "winston";
import chalk from "chalk";
import type { Format } from "logform";

let colorize = true;
const colorPerLevel: Record<string, (str: string) => string> = {
  silly: (str) => chalk.green(str),
  debug: (str) => chalk.grey(str),
  info: (str) => str,
  warn: (str) => chalk.yellow(str),
  error: (str) => chalk.red(str),
};

const formatPrint: Format = format.printf((info) => {
  const color =
    colorPerLevel[colorize ? info.level : "no-color"] ?? ((str: string) => str);

  return color(
    `[ ${info.timestamp} ] [ ${info.level.toUpperCase().padEnd(5, " ")} ] [ ${(info.loggerName ?? "").padEnd(50, " ").substring(0, 50)} ]: ${info.message}`,
  );
});

const consoleTransport = new transports.Console({
  level: "info",
  format: format.combine(format.timestamp({}), format.splat(), formatPrint),
});

const logger = createWinstonLogger({
  transports: [consoleTransport],
});

export const customLogger = {
  logger,
  configure(level: string, useColors: boolean) {
    consoleTransport.level = level;
    colorize = useColors;
  },
};
