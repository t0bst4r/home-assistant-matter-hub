import { HomeAssistantEntityState } from "./home-assistant-entity-state.js";
import { HomeAssistantEntityRegistry } from "./home-assistant-entity-registry.js";

export interface HomeAssistantEntityInformation {
  entity_id: string;
  registry?: HomeAssistantEntityRegistry;
  state: HomeAssistantEntityState;
}
