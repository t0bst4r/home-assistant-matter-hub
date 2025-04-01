import {
  type Environment,
  Environmental,
  type StorageContext,
  type StorageManager,
  StorageService,
} from "@matter/main";
import { type Service, register } from "../environment/register.js";

export class AppStorage implements Service {
  static [Environmental.create](environment: Environment) {
    return new AppStorage(environment);
  }

  readonly construction: Promise<void>;
  private storageManager!: StorageManager;

  constructor(private readonly environment: Environment) {
    register(environment, AppStorage, this);
    this.construction = this.initialize();
  }

  private async initialize() {
    this.storageManager = await this.environment
      .load(StorageService)
      .then((s) => s.open("app"));
  }

  async [Symbol.asyncDispose]() {
    await this.storageManager.close();
  }

  createContext(context: string): StorageContext {
    return this.storageManager.createContext(context);
  }
}
