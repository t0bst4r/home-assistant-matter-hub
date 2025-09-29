import { getConfig, type HassConfig } from "home-assistant-js-websocket";
import { Service } from "../../core/ioc/service.js";
import type { HomeAssistantClient } from "./home-assistant-client.js";

export class HomeAssistantConfig extends Service {
  private config!: HassConfig;

  get unitSystem() {
    return this.config.unit_system;
  }

  constructor(private readonly client: HomeAssistantClient) {
    super("HomeAssistantConfig");
  }

  protected override async initialize() {
    this.config = await getConfig(this.client.connection);
  }
}
