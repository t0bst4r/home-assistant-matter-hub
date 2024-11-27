import { HomeAssistantEntityState } from "@home-assistant-matter-hub/common";
import { Behavior, Endpoint, EndpointType } from "@matter/main";
import { HomeAssistantEntityBehavior } from "./custom-behaviors/home-assistant-entity-behavior.js";
import { Logger } from "winston";
import { createLogger } from "../logging/create-logger.js";

export class MatterDevice<
  T extends EndpointType = EndpointType.Empty,
> extends Endpoint {
  static entityIdToId(entityId: string): string {
    return entityId.replace(/\./g, "_");
  }

  public readonly entityId: string;
  private readonly logger: Logger;

  constructor(
    type: T,
    homeAssistant: HomeAssistantEntityBehavior.State,
    options?: Endpoint.Options<T>,
  ) {
    const entityId = homeAssistant.registry.entity_id;
    const logger = createLogger(`${entityId} / device`);

    if (!(HomeAssistantEntityBehavior.id in type.behaviors)) {
      throw new Error(
        `${type.name} does not utilize HomeAssistantBehavior (${entityId})`,
      );
    }

    logger.debug(
      "Initializing %s with state:\n%s",
      entityId,
      JSON.stringify(homeAssistant.entity, null, 2),
    );

    const newOptions: {
      id: string;
      homeAssistant: Behavior.StateOf<typeof HomeAssistantEntityBehavior>;
    } = {
      id: MatterDevice.entityIdToId(entityId),
      homeAssistant,
      ...options,
    };
    super(type, newOptions);
    this.logger = logger;
    this.entityId = entityId;
  }

  async update(entity: HomeAssistantEntityState) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    this.logger.silly(
      "Updating %s with state:\n%s",
      this.entityId,
      JSON.stringify(entity, null, 2),
    );
    await this.setStateOf(HomeAssistantEntityBehavior, { entity: entity });
  }
}
