import type { HomeAssistantEntityState } from "@home-assistant-matter-hub/common";
import {
  DestroyedDependencyError,
  TransactionDestroyedError,
} from "@matter/general";
import type { EndpointType } from "@matter/main";
import debounce from "debounce";
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
    // Debounce state updates to batch rapid changes into a single transaction.
    // Home Assistant often sends multiple attribute updates in quick succession
    // (e.g., media player: volume + source + play state). Without debouncing,
    // each update triggers separate Matter.js transactions, causing overhead
    // and verbose transaction queueing logs. A 50ms window batches these updates
    // while remaining imperceptible to users.
    this.flushUpdate = debounce(this.flushPendingUpdate.bind(this), 50);
  }

  private lastState?: HomeAssistantEntityState;
  private readonly flushUpdate: ReturnType<typeof debounce>;

  override async delete() {
    // Clear any pending debounce timers to prevent callbacks firing after deletion
    this.flushUpdate.clear();
    await super.delete();
  }

  async updateStates(states: HomeAssistantStates) {
    const state = states[this.entityId] ?? {};
    if (JSON.stringify(state) === JSON.stringify(this.lastState ?? {})) {
      return;
    }

    this.lastState = state;
    this.flushUpdate(state);
  }

  private async flushPendingUpdate(state: HomeAssistantEntityState) {
    // Wait for endpoint to finish initializing before attempting state updates.
    // During startup, factory reset, or device re-pairing, HA may send state
    // updates while endpoints are still being constructed. Attempting setStateOf
    // during initialization causes UninitializedDependencyError crashes.
    try {
      await this.construction.ready;
    } catch {
      // If construction fails, endpoint is unusable, skip the update
      return;
    }

    try {
      const current = this.stateOf(HomeAssistantEntityBehavior).entity;
      await this.setStateOf(HomeAssistantEntityBehavior, {
        entity: { ...current, state },
      });
    } catch (error) {
      // Suppress errors that are expected during normal shutdown:
      // - TransactionDestroyedError: Transaction context destroyed after shutdown
      // - DestroyedDependencyError: Endpoint was destroyed/deleted
      // All other errors (crashes, invalid states, etc.) should propagate
      if (
        error instanceof TransactionDestroyedError ||
        error instanceof DestroyedDependencyError
      ) {
        return;
      }
      throw error;
    }
  }
}
