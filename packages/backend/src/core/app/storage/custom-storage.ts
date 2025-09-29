import fs from "node:fs";
import { ClusterId } from "@home-assistant-matter-hub/common";
import type { Logger } from "@matter/general";
import { StorageBackendDisk } from "@matter/nodejs";
import { forEach } from "lodash-es";
import { LegacyCustomStorage } from "./legacy-custom-storage.js";

export class CustomStorage extends StorageBackendDisk {
  constructor(
    private readonly log: Logger,
    private readonly path: string,
  ) {
    super(path);
  }

  override async initialize() {
    await super.initialize();
    if (fs.existsSync(`${this.path}.json`)) {
      await this.migrateLegacyStorage();
    }
  }

  override async keys(contexts: string[]): Promise<string[]> {
    const key = this.getContextBaseKey(contexts);
    const clusters: string[] = Object.values(ClusterId);
    if (
      key.startsWith("root.parts.aggregator.parts.") &&
      clusters.some((cluster) => key.endsWith(cluster))
    ) {
      return [];
    }
    return await super.keys(contexts);
  }

  private async migrateLegacyStorage() {
    const path = this.path;
    this.log.warn(
      `Migrating legacy storage (JSON file) to new storage (directory): ${path}`,
    );
    const legacyStorage = new LegacyCustomStorage(this.log, `${path}.json`);
    legacyStorage.initialize();
    forEach(legacyStorage.data, (values, context) => {
      forEach(values, (value, key) => {
        this.set([context], key, value);
      });
    });
    await legacyStorage.close();
    fs.renameSync(`${path}.json`, `${path}/backup.alpha-69.json`);
  }
}
