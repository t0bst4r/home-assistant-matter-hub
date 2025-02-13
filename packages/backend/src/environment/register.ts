import { Environment, Environmental } from "@matter/main";
import { LoggerService } from "./logger.js";

export interface Service extends Environmental.Service {
  [Symbol.asyncDispose]?: () => void | Promise<void>;
}

export function register<T extends Service>(
  environment: Environment,
  factory: Environmental.Factory<T>,
  service: T,
) {
  const logger = environment.get(LoggerService).get("Environment");
  environment.set(factory, service);
  const close = async () => {
    logger.debug(`Disposing ${factory.name}`);
    await service[Symbol.asyncDispose]?.();
    logger.debug(`Disposed ${factory.name}`);
  };
  environment.runtime.add({ [Symbol.asyncDispose]: close });
}
