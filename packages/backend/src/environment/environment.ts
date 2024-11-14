import { Environment, StorageService, VariableService } from "@matter/main";
import { MdnsService } from "@matter/main/protocol";
import { createStorageService } from "../storage/create-storage-service.js";

export interface EnvironmentConfig {
  mdnsNetworkInterface: string | undefined;
  storageLocation: string | undefined;
}

export function createEnvironment(
  environment: Environment,
  config: EnvironmentConfig,
): Environment {
  new VariableService(environment);

  new MdnsService(environment, {
    ipv4: true,
    networkInterface: notEmpty(config.mdnsNetworkInterface),
  });

  const storageConfig = createStorageService(config.storageLocation);
  const storageService = environment.get(StorageService);
  storageService.location = storageConfig.location;
  storageService.factory = storageConfig.factory;

  return environment;
}

function notEmpty(val: string | undefined | null): string | undefined {
  const value = val?.trim();
  if (value == undefined || value.length === 0) {
    return undefined;
  }
  return value;
}
