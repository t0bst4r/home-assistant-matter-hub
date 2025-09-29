import { type Environment, StorageService } from "@matter/main";
import { WebApi } from "../../api/web-api.js";
import { BridgeFactory } from "../../services/bridges/bridge-factory.js";
import { BridgeService } from "../../services/bridges/bridge-service.js";
import { HomeAssistantActions } from "../../services/home-assistant/home-assistant-actions.js";
import { HomeAssistantClient } from "../../services/home-assistant/home-assistant-client.js";
import { HomeAssistantConfig } from "../../services/home-assistant/home-assistant-config.js";
import { HomeAssistantRegistry } from "../../services/home-assistant/home-assistant-registry.js";
import { AppStorage } from "../../services/storage/app-storage.js";
import { BridgeStorage } from "../../services/storage/bridge-storage.js";
import { LoggerService } from "../app/logger.js";
import type { Options } from "../app/options.js";
import { BridgeEnvironmentFactory } from "./bridge-environment.js";
import { EnvironmentBase } from "./environment-base.js";

export class AppEnvironment extends EnvironmentBase {
  static async create(rootEnv: Environment, options: Options) {
    const app = new AppEnvironment(rootEnv, options);
    await app.construction;
    return app;
  }

  private readonly construction: Promise<void>;

  private constructor(
    rootEnv: Environment,
    private readonly options: Options,
  ) {
    const logger = rootEnv.get(LoggerService);

    super({
      id: "App",
      log: logger.get("AppContainer"),
      parent: rootEnv,
    });
    this.construction = this.init();
  }

  private async init() {
    const logger = this.get(LoggerService);

    this.set(LoggerService, logger);
    this.set(AppStorage, new AppStorage(await this.load(StorageService)));
    this.set(BridgeStorage, new BridgeStorage(await this.load(AppStorage)));

    this.set(
      HomeAssistantClient,
      new HomeAssistantClient(logger, this.options.homeAssistant),
    );
    this.set(
      HomeAssistantConfig,
      new HomeAssistantConfig(await this.load(HomeAssistantClient)),
    );
    this.set(
      HomeAssistantActions,
      new HomeAssistantActions(logger, await this.load(HomeAssistantClient)),
    );
    this.set(
      HomeAssistantRegistry,
      new HomeAssistantRegistry(
        await this.load(HomeAssistantClient),
        this.options.homeAssistant,
      ),
    );

    this.set(BridgeFactory, new BridgeEnvironmentFactory(this));
    this.set(
      BridgeService,
      new BridgeService(
        await this.load(BridgeStorage),
        await this.load(BridgeFactory),
        this.options.bridgeService,
      ),
    );

    this.set(
      WebApi,
      new WebApi(logger, await this.load(BridgeService), this.options.webApi),
    );

    this.runtime.add({
      [Symbol.asyncDispose]: () => this.dispose(),
    });
  }
}
