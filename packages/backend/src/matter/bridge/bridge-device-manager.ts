import { Agent, Endpoint, Environment } from "@matter/main";
import {
  BridgeData,
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
  private initialized = false;
  private unsubscribe?: () => void;

  constructor(
    private readonly environment: Environment,
    private readonly aggregator: Endpoint,
  ) {}

  async initialize(bridge: BridgeData) {
    if (this.initialized) {
      return;
    }
    const registry = this.environment.get(HomeAssistantRegistry);
    await Promise.resolve(
      this.aggregator.act(async (agent) => {
        const entityIds = await this.createEntities(agent, registry, bridge);
        this.unsubscribe?.();
        this.unsubscribe = await registry.subscribeStates(
          entityIds,
          this.updateEntities.bind(this),
        );
      }),
    ).catch((e) => {
      this.unsubscribe?.();
      this.reset();
      throw e;
    });
    this.initialized = true;
  }

  reset() {
    if (!this.initialized) {
      return;
    }
    this.aggregator.parts.clear();
    this.initialized = false;
  }

  private async createEntities(
    agent: Agent,
    registry: HomeAssistantRegistry,
    bridgeData: BridgeData,
  ): Promise<string[]> {
    const entities = await registry.allEntities();
    const entityIds: string[] = [];
    for (const entity of entities) {
      if (await this.createEntity(agent, bridgeData, entity)) {
        entityIds.push(entity.entity_id);
      }
    }
    return entityIds;
  }

  private async createEntity(
    agent: Agent,
    bridge: BridgeData,
    entity: HomeAssistantEntityInformation,
  ) {
    if (!isValidEntity(entity) || !matchesEntityFilter(bridge.filter, entity)) {
      return false;
    }
    const endpointId = this.deviceId(entity.entity_id);
    const endpointType = createDevice(
      lockKey(entity),
      entity,
      bridge.featureFlags,
    );
    if (endpointType) {
      const endpoint = new Endpoint(endpointType, {
        id: endpointId,
      });
      await agent.endpoint.add(endpoint);
      return true;
    }
    return false;
  }

  private async updateEntities(updates: Dictionary<HomeAssistantEntityState>) {
    const states = _.values(updates);
    const handles = states.map((state) => this.updateEntity(state));
    await Promise.all(handles);
  }

  private async updateEntity(state: HomeAssistantEntityState) {
    const endpointId = this.deviceId(state.entity_id);
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

  private deviceId(entityId: string): string {
    return entityId.replace(/\./g, "_");
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
