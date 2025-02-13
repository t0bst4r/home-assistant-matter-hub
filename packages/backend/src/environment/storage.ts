import { Environment, StorageService } from "@matter/main";
import os from "node:os";
import path from "node:path";
import fs from "node:fs";
import _ from "lodash";
import { LoggerService } from "./logger.js";
import { CustomStorage } from "./storage/custom-storage.js";

export function storage(
  environment: Environment,
  storageLocation: string | undefined,
) {
  const loggerService = environment.get(LoggerService);
  const location = resolveStorageLocation(storageLocation);
  fs.mkdirSync(location, { recursive: true });
  const storageService = environment.get(StorageService);
  storageService.location = location;
  storageService.factory = (ns) =>
    new CustomStorage(loggerService, path.resolve(location, ns));
}

function resolveStorageLocation(storageLocation: string | undefined) {
  const homedir = os.homedir();
  return storageLocation
    ? path.resolve(storageLocation.replace(/^~\//, homedir + "/"))
    : path.join(homedir, ".home-assistant-matter-hub");
}
