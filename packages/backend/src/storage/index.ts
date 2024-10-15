import {
  Environment,
  StorageService as MatterStorageService,
} from "@project-chip/matter.js/environment";
import { Logger } from "winston";
import { ServiceBase } from "../utils/service.js";
import {
  StorageContext,
  StorageManager,
} from "@project-chip/matter.js/storage";

export class StorageService extends ServiceBase {
  private storage?: StorageManager;

  constructor(
    logger: Logger,
    private readonly environment: Environment,
  ) {
    super("StorageService", logger);
  }

  async start() {
    this.storage = await this.environment
      .get(MatterStorageService)
      .open("HomeAssistantMatterHub");
  }

  async close() {
    this.storage?.close();
  }

  createContext(context: string): StorageContext {
    if (!this.storage) {
      throw new Error(
        `Cannot create storage context '${context}' when storage is not initialized.`,
      );
    }
    return this.storage.createContext(context);
  }
}
