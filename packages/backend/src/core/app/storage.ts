import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { type Environment, StorageService } from "@matter/main";
import { LoggerService } from "./logger.js";
import { CustomStorage } from "./storage/custom-storage.js";

export interface StorageOptions {
  location?: string;
}

export function storage(environment: Environment, options: StorageOptions) {
  const logger = environment.get(LoggerService).get("CustomStorage");
  const location = resolveStorageLocation(options.location);
  fs.mkdirSync(location, { recursive: true });
  const storageService = environment.get(StorageService);
  storageService.location = location;
  storageService.factory = (ns) =>
    new CustomStorage(logger, path.resolve(location, ns));
}

function resolveStorageLocation(storageLocation: string | undefined) {
  const homedir = os.homedir();
  return storageLocation
    ? path.resolve(storageLocation.replace(/^~\//, `${homedir}/`))
    : path.join(homedir, ".home-assistant-matter-hub");
}
