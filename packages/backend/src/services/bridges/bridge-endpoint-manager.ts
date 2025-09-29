import type { Endpoint } from "@matter/main";
import { Service } from "../../core/ioc/service.js";
import { AggregatorEndpoint } from "../../matter/endpoints/aggregator-endpoint.js";
import type { EntityEndpoint } from "../../matter/endpoints/entity-endpoint.js";
import { LegacyEndpoint } from "../../matter/endpoints/legacy/legacy-endpoint.js";
import { subscribeEntities } from "../home-assistant/api/subscribe-entities.js";
import type { HomeAssistantClient } from "../home-assistant/home-assistant-client.js";
import type { HomeAssistantStates } from "../home-assistant/home-assistant-registry.js";
import type { BridgeRegistry } from "./bridge-registry.js";

export class BridgeEndpointManager extends Service {
  readonly root: Endpoint;
  private entityIds: string[] = [];
  private unsubscribe?: () => void;

  constructor(
    private readonly client: HomeAssistantClient,
    private readonly registry: BridgeRegistry,
  ) {
    super("BridgeEndpointManager");
    this.root = new AggregatorEndpoint("aggregator");
  }

  override async dispose(): Promise<void> {
    this.stopObserving();
  }

  async startObserving() {
    this.stopObserving();

    if (!this.entityIds.length) {
      return;
    }

    this.unsubscribe = subscribeEntities(
      this.client.connection,
      (e) => this.updateStates(e),
      this.entityIds,
    );
  }

  stopObserving() {
    this.unsubscribe?.();
    this.unsubscribe = undefined;
  }

  async refreshDevices() {
    this.registry.refresh();

    const endpoints = this.root.parts.map((p) => p as EntityEndpoint);
    this.entityIds = this.registry.entityIds;

    const existingEndpoints: EntityEndpoint[] = [];
    for (const endpoint of endpoints) {
      if (!this.entityIds.includes(endpoint.entityId)) {
        await endpoint.delete();
      } else {
        existingEndpoints.push(endpoint);
      }
    }

    for (const entityId of this.entityIds) {
      let endpoint = existingEndpoints.find((e) => e.entityId === entityId);
      if (!endpoint) {
        endpoint = await LegacyEndpoint.create(this.registry, entityId);
        if (endpoint) {
          await this.root.add(endpoint);
        }
      }
    }

    if (this.unsubscribe) {
      this.startObserving();
    }
  }

  async updateStates(states: HomeAssistantStates) {
    const endpoints = this.root.parts.map((p) => p as EntityEndpoint);
    for (const endpoint of endpoints) {
      await endpoint.updateStates(states);
    }
  }
}
