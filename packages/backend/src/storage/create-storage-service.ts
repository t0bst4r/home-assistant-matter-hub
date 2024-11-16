import { Storage } from "@matter/main";
import path from "node:path";
import os from "node:os";
import fs from "node:fs";
import { StorageBackendJsonFile } from "@matter/nodejs";
import { createLogger } from "../logging/create-logger.js";
import { ClusterId } from "@home-assistant-matter-hub/common";

interface StorageService {
  readonly location: string;
  readonly factory: (namespace: string) => Storage;
}

export function createStorageService(storageLocation?: string): StorageService {
  const logger = createLogger("Storage");
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
    this.applyTemporaryFixes([
      ClusterId.colorControl,
      ClusterId.windowCovering,
    ]);
    this.isInitialized = true;
  }

  private applyTemporaryFixes(clusters: ClusterId[]) {
    if (clusters.length === 0) {
      return;
    }
    const buggyKeys = Object.keys(this.store).filter(
      (key) =>
        key.startsWith("root.parts.") &&
        clusters.some((cluster) => key.endsWith(`.${cluster}`)),
    );
    buggyKeys.forEach((key) => delete this.store[key]);
  }
}
