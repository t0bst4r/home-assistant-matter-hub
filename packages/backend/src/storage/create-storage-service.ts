import { Storage } from "@project-chip/matter.js/storage";
import path from "node:path";
import os from "node:os";
import fs from "node:fs";
import { StorageBackendJsonFile } from "@project-chip/matter-node.js/storage";
import { Logger } from "winston";
import { createChildLogger } from "../logging/create-child-logger.js";

interface StorageService {
  readonly location: string;
  readonly factory: (namespace: string) => Storage;
}

export function createStorageService(
  log: Logger,
  storageLocation?: string,
): StorageService {
  const logger = createChildLogger(log, "Storage");
  const homedir = os.homedir();
  const location = storageLocation
    ? path.resolve(storageLocation.replace(/^~\//, homedir + "/"))
    : path.join(homedir, ".home-assistant-matter-hub");

  logger.info("Storage location: %s", location);
  fs.mkdirSync(location, { recursive: true });

  return {
    location,
    factory: (ns) => new CustomStorage(path.resolve(location, ns + ".json")),
  };
}

export class CustomStorage extends StorageBackendJsonFile {
  override async initialize() {
    try {
      await super.initialize();
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.name !== "SyntaxError") {
          throw error;
        }
      }
    }
    this.isInitialized = true;
  }
}
