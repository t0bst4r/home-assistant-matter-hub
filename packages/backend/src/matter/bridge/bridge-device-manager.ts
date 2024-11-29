import { Endpoint, Environment } from "@matter/main";
import {
  BridgeData,
  BridgeFeatureFlags,
  HomeAssistantEntityInformation,
  HomeAssistantEntityState,
} from "@home-assistant-matter-hub/common";
import { createDevice } from "./create-device.js";
import { HomeAssistantEntityBehavior } from "../custom-behaviors/home-assistant-entity-behavior.js";
import { HomeAssistantRegistry } from "../../home-assistant/home-assistant-registry.js";
import _, { Dictionary } from "lodash";
import { matchesEntityFilter } from "./matcher/matches-entity-filter.js";
import AsyncLock from "async-lock";

export class BridgeDeviceManager {
  private unsubscribe?: () => void;

  constructor(
    private readonly environment: Environment,
    private readonly aggregator: Endpoint,
  ) {}

  async loadDevices(bridge: BridgeData) {
    const registry = this.environment.get(HomeAssistantRegistry);
    try {
      this.unsubscribe?.();
      const entityIds = await this.upsertDevices(registry, bridge);
      this.unsubscribe = await registry.subscribeStates(
        entityIds,
        this.updateEntities.bind(this),
      );
    } catch (e) {
      this.unsubscribe?.();
      throw e;
    }
  }

  private async upsertDevices(
    registry: HomeAssistantRegistry,
    bridgeData: BridgeData,
  ): Promise<string[]> {
    const allEntities = await registry.allEntities();
    const entities = allEntities.filter(
      (entity) =>
        isValidEntity(entity) && matchesEntityFilter(bridgeData.filter, entity),
    );
    const endpointIds = _.fromPairs(
      entities.map((e) => [e.entity_id, createEndpointId(e.entity_id)]),
    );
    const updateEndpoints = this.aggregator.parts.filter((part) =>
      entities.some((e) => endpointIds[e.entity_id] === part.id),
    );
    const removeEndpoints = this.aggregator.parts.filter(
      (part) => !entities.some((e) => endpointIds[e.entity_id] === part.id),
    );
    await Promise.all(removeEndpoints.map((endpoint) => endpoint.delete()));
    const remainingEndpoints = await Promise.all(
      entities.map((entity) => {
        const endpointId = endpointIds[entity.entity_id];
        return this.upsertDevice(
          entity,
          bridgeData.featureFlags ?? {},
          endpointId,
          updateEndpoints.find((e) => e.id === endpointId),
        );
      }),
    );
    return remainingEndpoints.filter((e): e is string => !!e);
  }

  private async upsertDevice(
    entity: HomeAssistantEntityInformation,
    featureFlags: BridgeFeatureFlags,
    endpointId: string,
    endpoint: Endpoint | undefined,
  ): Promise<string | undefined> {
    const endpointType = createDevice(lockKey(entity), entity, featureFlags);

    if (endpoint) {
      if (endpoint.type.deviceClass === endpointType?.deviceClass) {
        return entity.entity_id;
      } else {
        await endpoint.delete();
      }
    }

    if (!endpointType) {
      return;
    }

    await this.aggregator.add(new Endpoint(endpointType, { id: endpointId }));
    return entity.entity_id;
  }

  private async updateEntities(updates: Dictionary<HomeAssistantEntityState>) {
    const states = _.values(updates);
    const handles = states.map((state) => this.updateEntity(state));
    await Promise.all(handles);
  }

  private async updateEntity(state: HomeAssistantEntityState) {
    const endpointId = createEndpointId(state.entity_id);
    const device = this.aggregator.parts.find((p) => p.id === endpointId);
    if (!device) {
      return;
    }
    const { entity } = device.stateOf(HomeAssistantEntityBehavior);
    const hasChanged = JSON.stringify(entity.state) !== JSON.stringify(state);
    if (!hasChanged) {
      return;
    }

    const lock = this.environment.get(AsyncLock);
    await lock.acquire(lockKey(entity), async () => {
      await device.setStateOf(HomeAssistantEntityBehavior, {
        entity: { ...entity, state },
      });
    });
  }
}

function isValidEntity(entity: HomeAssistantEntityInformation): boolean {
  return (
    entity.registry?.disabled_by == null && entity.registry?.hidden_by == null
  );
}

function lockKey(entity: { entity_id: string }): string {
  return entity.entity_id;
}

function createEndpointId(entity_id: string): string {
  return entity_id.replace(/\./g, "_");
}
