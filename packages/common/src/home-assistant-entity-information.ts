import { HomeAssistantEntityState } from "./home-assistant-entity-state.js";
import { HomeAssistantEntityRegistry } from "./home-assistant-entity-registry.js";
import { HomeAssistantDeviceRegistry } from "./home-assistant-device-registry.js";

export interface HomeAssistantEntityInformation {
  entity_id: string;
  registry?: HomeAssistantEntityRegistry;
  deviceRegistry?: HomeAssistantDeviceRegistry;
  state: HomeAssistantEntityState;
}
