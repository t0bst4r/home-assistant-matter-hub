import { createChildLogger, customLogger } from "./custom-logger.js";

export function createLogger(name: string) {
  return createChildLogger(customLogger.logger, name);
}
