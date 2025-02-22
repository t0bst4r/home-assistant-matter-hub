import { StorageBackendDisk } from "@matter/nodejs";
import _ from "lodash";
import { Logger } from "@matter/general";
import { LoggerService } from "../logger.js";
import { LegacyCustomStorage } from "./legacy-custom-storage.js";
import fs from "node:fs";
import { ClusterId } from "@home-assistant-matter-hub/common";

export class CustomStorage extends StorageBackendDisk {
  private readonly log: Logger;

  constructor(
    private readonly loggerService: LoggerService,
    private readonly path: string,
  ) {
    super(path);
    this.log = loggerService.get("CustomStorage");
  }

  override async initialize() {
    super.initialize();
    if (fs.existsSync(this.path + ".json")) {
      await this.migrateLegacyStorage(this.loggerService, this.path);
    }
  }

  override keys(contexts: string[]): string[] {
    const key = this.getContextBaseKey(contexts);
    const clusters: string[] = Object.values(ClusterId);
    if (
      key.startsWith("root.parts.aggregator.parts.") &&
      clusters.some((cluster) => key.endsWith(cluster))
    ) {
      return [];
    }
    return super.keys(contexts);
  }

  private async migrateLegacyStorage(
    loggerService: LoggerService,
    path: string,
  ) {
    this.log.warn(
      `Migrating legacy storage (JSON file) to new storage (directory): ${path}`,
    );
    const legacyStorage = new LegacyCustomStorage(
      loggerService,
      path + ".json",
    );
    legacyStorage.initialize();
    _.forEach(legacyStorage.data, (values, context) => {
      _.forEach(values, (value, key) => {
        this.set([context], key, value);
      });
    });
    await legacyStorage.close();
    fs.renameSync(path + ".json", path + "/backup.alpha-69.json");
  }
}
