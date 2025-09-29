import type { HomeAssistantEntityState } from "@home-assistant-matter-hub/common";
import type { EndpointType } from "@matter/main";
import type { BridgeRegistry } from "../../../services/bridges/bridge-registry.js";
import type { HomeAssistantStates } from "../../../services/home-assistant/home-assistant-registry.js";
import { HomeAssistantEntityBehavior } from "../../behaviors/home-assistant-entity-behavior.js";
import { EntityEndpoint } from "../../endpoints/entity-endpoint.js";
import { createLegacyEndpointType } from "./create-legacy-endpoint-type.js";

/**
 * @deprecated
 */
export class LegacyEndpoint extends EntityEndpoint {
  public static async create(
    registry: BridgeRegistry,
    entityId: string,
  ): Promise<LegacyEndpoint | undefined> {
    const deviceRegistry = registry.deviceOf(entityId);
    const state = registry.initialState(entityId);
    const entity = registry.entity(entityId);
    const payload = {
      entity_id: entityId,
      state,
      registry: entity,
      deviceRegistry,
    };
    const type = createLegacyEndpointType(payload);
    if (!type) {
      return;
    }
    return new LegacyEndpoint(type, entityId);
  }

  private constructor(type: EndpointType, entityId: string) {
    super(type, entityId);
  }

  private lastState?: HomeAssistantEntityState;

  async updateStates(states: HomeAssistantStates) {
    const state = states[this.entityId] ?? {};
    if (JSON.stringify(state) === JSON.stringify(this.lastState ?? {})) {
      return;
    }
    const current = this.stateOf(HomeAssistantEntityBehavior).entity;
    await this.setStateOf(HomeAssistantEntityBehavior, {
      entity: { ...current, state },
    });
  }
}
