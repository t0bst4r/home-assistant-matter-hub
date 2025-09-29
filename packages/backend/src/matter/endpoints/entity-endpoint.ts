import { Endpoint } from "@matter/main";
import type { EndpointType } from "@matter/main/node";
import type { HomeAssistantStates } from "../../services/home-assistant/home-assistant-registry.js";

export abstract class EntityEndpoint extends Endpoint {
  protected constructor(
    type: EndpointType,
    readonly entityId: string,
  ) {
    super(type, { id: createEndpointId(entityId) });
  }

  abstract updateStates(states: HomeAssistantStates): Promise<void>;
}

function createEndpointId(entityId: string): string {
  return entityId.replace(/\./g, "_");
}
