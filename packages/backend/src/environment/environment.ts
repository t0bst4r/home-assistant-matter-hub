import { Environment, VariableService } from "@matter/main";
import { mdns } from "./mdns.js";
import { storage } from "./storage.js";
import { logging } from "./logger.js";

export interface EnvironmentConfig {
  mdnsNetworkInterface: string | undefined;
  storageLocation: string | undefined;
  logLevel: string | undefined;
  disableLogColors: boolean | undefined;
}

export function createEnvironment(
  environment: Environment,
  config: EnvironmentConfig,
): Environment {
  new VariableService(environment);
  logging(environment, config.logLevel, config.disableLogColors ?? false);
  mdns(environment, notEmpty(config.mdnsNetworkInterface));
  storage(environment, notEmpty(config.storageLocation));
  return environment;
}

function notEmpty(val: string | undefined | null): string | undefined {
  const value = val?.trim();
  if (value == undefined || value.length === 0) {
    return undefined;
  }
  return value;
}
