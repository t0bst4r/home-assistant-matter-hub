import type {
  StorageContext,
  StorageManager,
  StorageService,
} from "@matter/main";
import { Service } from "../../core/ioc/service.js";

export class AppStorage extends Service {
  private storageManager!: StorageManager;

  constructor(private readonly storageService: StorageService) {
    super("AppStorage");
  }

  protected override async initialize() {
    this.storageManager = await this.storageService.open("app");
  }
  override async dispose(): Promise<void> {
    await this.storageManager.close();
  }

  createContext(context: string): StorageContext {
    return this.storageManager.createContext(context);
  }
}
