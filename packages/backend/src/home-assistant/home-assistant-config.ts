import { Environment, Environmental } from "@matter/main";
import { register, Service } from "../environment/register.js";
import { HomeAssistantClient } from "./home-assistant-client.js";
import { getConfig, HassConfig } from "home-assistant-js-websocket";

export class HomeAssistantConfig implements Service {
  static [Environmental.create](environment: Environment) {
    return new this(environment);
  }

  private readonly environment: Environment;
  readonly construction: Promise<void>;
  private config!: HassConfig;

  get unitSystem() {
    return this.config.unit_system;
  }

  constructor(environment: Environment) {
    register(environment, HomeAssistantConfig, this);
    this.environment = environment;
    this.construction = this.initialize();
  }

  private async initialize(): Promise<void> {
    const { connection } = await this.environment.load(HomeAssistantClient);
    this.config = await getConfig(connection);
  }
}
