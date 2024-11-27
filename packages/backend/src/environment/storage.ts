import { Environment, StorageService } from "@matter/main";
import os from "node:os";
import path from "node:path";
import fs from "node:fs";
import { StorageBackendJsonFile } from "@matter/nodejs";
import { ClusterId } from "@home-assistant-matter-hub/common";

export function storage(
  environment: Environment,
  storageLocation: string | undefined,
) {
  const location = resolveStorageLocation(storageLocation);
  fs.mkdirSync(location, { recursive: true });
  const storageService = environment.get(StorageService);
  storageService.location = location;
  storageService.factory = (ns) =>
    new CustomStorage(path.resolve(location, ns + ".json"));
}

function resolveStorageLocation(storageLocation: string | undefined) {
  const homedir = os.homedir();
  return storageLocation
    ? path.resolve(storageLocation.replace(/^~\//, homedir + "/"))
    : path.join(homedir, ".home-assistant-matter-hub");
}

class CustomStorage extends StorageBackendJsonFile {
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
