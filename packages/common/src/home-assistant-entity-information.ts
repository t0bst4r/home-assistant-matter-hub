import type { HomeAssistantDeviceRegistry } from "./home-assistant-device-registry.js";
import type { HomeAssistantEntityRegistry } from "./home-assistant-entity-registry.js";
import type { HomeAssistantEntityState } from "./home-assistant-entity-state.js";

export interface HomeAssistantEntityInformation {
  entity_id: string;
  registry?: HomeAssistantEntityRegistry;
  deviceRegistry?: HomeAssistantDeviceRegistry;
  state: HomeAssistantEntityState;
}
