import { Environment, Environmental } from "@matter/main";
import {
  HomeAssistantEntityInformation,
  HomeAssistantEntityState,
  HomeAssistantDeviceRegistry,
} from "@home-assistant-matter-hub/common";
import { getRegistry, getDeviceRegistry } from "./api/get-registry.js";
import { HomeAssistantClient } from "./home-assistant-client.js";
import { getStates } from "home-assistant-js-websocket";
import _, { Dictionary } from "lodash";
import { subscribeEntities } from "./api/subscribe-entities.js";

export class HomeAssistantRegistry {
  static [Environmental.create](environment: Environment) {
    return new this(environment);
  }

  constructor(private readonly environment: Environment) {
    environment.set(HomeAssistantRegistry, this);
  }

  async allEntities(): Promise<HomeAssistantEntityInformation[]> {
    const client = await this.environment.load(HomeAssistantClient);
    const entityRegistry = _.keyBy(
      await getRegistry(client.connection),
      (r) => r.entity_id,
    );
    const deviceRegistry = _.keyBy(
      await getDeviceRegistry(client.connection),
      (r) => r.id,
    );
    const entityStates = _.keyBy(
      await getStates(client.connection),
      (s) => s.entity_id,
    );
    const entityIds = _.uniq(
      _.keys(entityRegistry).concat(_.keys(entityStates)),
    );

    const deviceRegistryByEntity: {
      [id: string]: HomeAssistantDeviceRegistry;
    } = {};
    entityIds.map((entity_id) => {
      const entity = entityRegistry[entity_id];
      if (entity && entity.device_id) {
        deviceRegistryByEntity[entity.entity_id] = deviceRegistry[
          entity.device_id
        ] as HomeAssistantDeviceRegistry;
      }
    });

    return entityIds.map((entity_id) => ({
      entity_id,
      registry: entityRegistry[entity_id],
      deviceRegistry: deviceRegistryByEntity[entity_id],
      state: entityStates[entity_id],
    }));
  }

  async subscribeStates(
    entityIds: string[],
    onChange: (states: Dictionary<HomeAssistantEntityState>) => void,
  ) {
    const client = await this.environment.load(HomeAssistantClient);
    return subscribeEntities(client.connection, onChange, entityIds);
  }
}
