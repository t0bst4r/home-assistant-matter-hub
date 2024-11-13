import { HomeAssistantEntityState } from "@home-assistant-matter-hub/common";
import { Behavior, Endpoint, EndpointType } from "@matter/main";
import { HomeAssistantBehavior } from "./custom-behaviors/home-assistant-behavior.js";

export class MatterDevice<
  T extends EndpointType = EndpointType.Empty,
> extends Endpoint {
  public readonly entityId: string;

  constructor(
    type: T,
    homeAssistant: HomeAssistantBehavior.State,
    options?: Endpoint.Options<T>,
  ) {
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
      ...options,
    };
    super(type, newOptions);
    this.entityId = entityId;
  }

  async update(entity: HomeAssistantEntityState) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    await this.setStateOf(HomeAssistantBehavior, { entity: entity });
  }
}
