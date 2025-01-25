import { Environment, Environmental } from "@matter/main";
import { createLogger } from "../logging/create-logger.js";

const logger = createLogger("Environment");

export interface Service extends Environmental.Service {
  [Symbol.asyncDispose]?: () => void | Promise<void>;
}

export function register<T extends Service>(
  environment: Environment,
  factory: Environmental.Factory<T>,
  service: T,
) {
  environment.set(factory, service);
  let disposed = false;
  const close = () => {
    if (disposed) {
      return;
    }
    disposed = true;
    logger.debug("Disposing %s", factory.name);
    service[Symbol.asyncDispose]?.();
    logger.debug("Disposed %s", factory.name);
  };
  environment.runtime.stopped.once(close);
  environment.runtime.crashed.once(close);
}
