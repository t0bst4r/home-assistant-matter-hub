import { Environment, Environmental } from "@matter/main";
import { register, Service } from "../environment/register.js";
import { HomeAssistantClient } from "./home-assistant-client.js";
import { HassConfig, subscribeConfig } from "home-assistant-js-websocket";
import { Logger } from "@matter/general";
import { LoggerService } from "../environment/logger.js";

export class HomeAssistantConfig implements Service {
  static [Environmental.create](environment: Environment) {
    return new this(environment);
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

    this.logger.info("Waiting for Home Assistant to be up and running");

    this.config = await new Promise((resolve) => {
      const unsubscribe = subscribeConfig(connection, (config) => {
        this.logger.debug(
          `Got an update from Home Assistant. System state is '${config.state}'`,
        );
        if (config.state === "RUNNING") {
          unsubscribe();
          resolve(config);
        }
      });
    });
  }
}
