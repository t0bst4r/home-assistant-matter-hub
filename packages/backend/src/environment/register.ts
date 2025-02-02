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
  let disposed = false;
  const close = () => {
    if (disposed) {
      return;
    }
    disposed = true;
    logger.debug(`Disposing ${factory.name}`);
    service[Symbol.asyncDispose]?.();
    logger.debug(`Disposed ${factory.name}`);
  };
  environment.runtime.stopped.once(close);
  environment.runtime.crashed.once(close);
}
