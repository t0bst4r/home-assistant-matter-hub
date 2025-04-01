import type { Logger } from "@matter/general";
import { type Environment, Environmental } from "@matter/main";
import { type HassConfig, getConfig } from "home-assistant-js-websocket";
import { LoggerService } from "../environment/logger.js";
import { type Service, register } from "../environment/register.js";
import { HomeAssistantClient } from "./home-assistant-client.js";

export class HomeAssistantConfig implements Service {
  static [Environmental.create](environment: Environment) {
    return new HomeAssistantConfig(environment);
  }

  private readonly environment: Environment;
  private readonly logger: Logger;
  readonly construction: Promise<void>;
  private config!: HassConfig;

  get unitSystem() {
    return this.config.unit_system;
  }

  constructor(environment: Environment) {
    register(environment, HomeAssistantConfig, this);
    this.environment = environment;
    this.logger = environment.get(LoggerService).get("HomeAssistantConfig");
    this.construction = this.initialize();
  }

  private async initialize(): Promise<void> {
    const { connection } = await this.environment.load(HomeAssistantClient);
    this.config = await getConfig(connection);
  }
}
