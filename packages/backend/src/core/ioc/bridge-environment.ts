import type { BridgeData } from "@home-assistant-matter-hub/common";
import type { Environment, Logger } from "@matter/general";
import { Bridge } from "../../services/bridges/bridge.js";
import { BridgeDataProvider } from "../../services/bridges/bridge-data-provider.js";
import { BridgeEndpointManager } from "../../services/bridges/bridge-endpoint-manager.js";
import { BridgeFactory } from "../../services/bridges/bridge-factory.js";
import { BridgeRegistry } from "../../services/bridges/bridge-registry.js";
import { HomeAssistantClient } from "../../services/home-assistant/home-assistant-client.js";
import { HomeAssistantRegistry } from "../../services/home-assistant/home-assistant-registry.js";
import { LoggerService } from "../app/logger.js";
import type { AppEnvironment } from "./app-environment.js";
import { EnvironmentBase } from "./environment-base.js";

export class BridgeEnvironment extends EnvironmentBase {
  static async create(parent: Environment, initialData: BridgeData) {
    const bridge = new BridgeEnvironment(parent, initialData);
    await bridge.construction;
    return bridge;
  }

  private readonly construction: Promise<void>;
  private readonly endpointManagerLogger: Logger;

  private constructor(parent: Environment, initialData: BridgeData) {
    const loggerService = parent.get(LoggerService);
    const log = loggerService.get(`BridgeEnvironment / ${initialData.id}`);

    super({ id: initialData.id, parent, log });
    this.endpointManagerLogger = loggerService.get("BridgeEndpointManager");
    this.construction = this.init();

    this.set(BridgeDataProvider, new BridgeDataProvider(initialData));
  }

  private async init() {
    this.set(
      BridgeRegistry,
      new BridgeRegistry(
        await this.load(HomeAssistantRegistry),
        this.get(BridgeDataProvider),
      ),
    );
    this.set(
      BridgeEndpointManager,
      new BridgeEndpointManager(
        await this.load(HomeAssistantClient),
        this.get(BridgeRegistry),
        this.endpointManagerLogger,
      ),
    );
  }
}

export class BridgeEnvironmentFactory extends BridgeFactory {
  constructor(private readonly parent: AppEnvironment) {
    super("BridgeEnvironmentFactory");
  }

  async create(initialData: BridgeData): Promise<Bridge> {
    const env = await BridgeEnvironment.create(this.parent, initialData);

    class BridgeWithEnvironment extends Bridge {
      override async dispose(): Promise<void> {
        await super.dispose();
        await env.dispose();
      }
    }

    const bridge = new BridgeWithEnvironment(
      env,
      env.get(LoggerService),
      await env.load(BridgeDataProvider),
      await env.load(BridgeEndpointManager),
    );
    await bridge.initialize();
    return bridge;
  }
}
