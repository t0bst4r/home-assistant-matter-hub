import { HomeAssistantEntityState } from "@home-assistant-matter-hub/common";
import { Endpoint, EndpointType } from "@project-chip/matter.js/endpoint";
import { HomeAssistantBehavior } from "./custom-behaviors/home-assistant-behavior.js";
import { Behavior } from "@project-chip/matter.js/behavior";

export class MatterDevice<
  T extends EndpointType = EndpointType.Empty,
> extends Endpoint {
  public readonly entityId: string;

  constructor(type: T, homeAssistant: HomeAssistantBehavior.State) {
    const entityId = homeAssistant.registry.entity_id;
    if (!(HomeAssistantBehavior.id in type.behaviors)) {
      throw new Error(
        `${type.name} does not utilize HomeAssistantBehavior (${entityId})`,
      );
    }

    const newOptions: {
      id: string;
      homeAssistant: Behavior.StateOf<typeof HomeAssistantBehavior>;
    } = {
      id: entityId.replace(/\./g, "_"),
      homeAssistant,
    };
    super(type, newOptions);
    this.entityId = entityId;
  }

  async update(state: HomeAssistantEntityState) {
    await this.setStateOf(HomeAssistantBehavior, { entity: state });
  }
}
