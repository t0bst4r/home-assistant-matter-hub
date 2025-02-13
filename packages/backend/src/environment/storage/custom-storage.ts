import { StorageBackendDisk } from "@matter/nodejs";
import _ from "lodash";
import { Logger } from "@matter/general";
import { LoggerService } from "../logger.js";
import { LegacyCustomStorage } from "./legacy-custom-storage.js";
import fs from "node:fs";

export class CustomStorage extends StorageBackendDisk {
    private readonly log: Logger;
  
  constructor(loggerService: LoggerService, path: string) {
    super(path);
    this.log = loggerService.get("CustomStorage");
    if (fs.existsSync(path + ".json")) {
      this.migrateLegacyStorage(loggerService, path);
    }
  }

  private migrateLegacyStorage(loggerService: LoggerService, path: string) {
    this.log.warn(`Migrating legacy storage (JSON file) to new storage (directory): ${path}`);
    const legacyStorage = new LegacyCustomStorage(loggerService, path + ".json");
    legacyStorage.initialize();
    _.forEach(legacyStorage.data, (values, context) => {
      _.forEach(values, (value, key) => {
        this.set([context], key, value);
      });
    });
    legacyStorage.close();
    fs.renameSync(path + ".json", path + "/backup.alpha-69.json");
  }
}