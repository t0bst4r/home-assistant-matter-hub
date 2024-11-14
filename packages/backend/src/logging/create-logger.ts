import { customLogger } from "./custom-logger.js";

export function createLogger(name: string) {
  return customLogger.logger.child({ loggerName: name });
}
