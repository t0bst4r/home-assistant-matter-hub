import {
  type CoverDeviceAttributes,
  CoverDeviceState,
  type CoverMappingOptions,
  type HomeAssistantEntityState,
} from "@home-assistant-matter-hub/common";
import { WindowCovering } from "@matter/main/clusters";
import type { Agent } from "@matter/main";
import { BridgeDataProvider } from "../../../../../services/bridges/bridge-data-provider.js";
import {
  type WindowCoveringConfig,
  WindowCoveringServer,
} from "../../../../behaviors/window-covering-server.js";
import { HomeAssistantEntityBehavior } from "../../../../behaviors/home-assistant-entity-behavior.js";
import { getCoverMappingOptions } from "../index.js";

const attributes = (entity: HomeAssistantEntityState) =>
  <CoverDeviceAttributes>entity.attributes;

const adjustPosition = (
  position: number | undefined,
  mapping: CoverMappingOptions,
): number | null => {
  if (position == null) {
    return null;
  }
  let percentValue = position;
  if (mapping.invertPercentage) {
    percentValue = 100 - percentValue;
  }
  return percentValue;
};

const config: WindowCoveringConfig = {
  getCurrentLiftPosition: (entity, agent) => {
    let position = attributes(entity).current_position;
    if (position == null) {
      const coverState = entity.state as CoverDeviceState;
      position =
        coverState === CoverDeviceState.closed
          ? 100
          : coverState === CoverDeviceState.open
            ? 0
            : undefined;
    }

    const bridgeDataProvider = agent.env.get(BridgeDataProvider);
    const mapping = getCoverMappingOptions(
      { entity_id: entity.entity_id, state: entity },
      bridgeDataProvider,
    );

    return adjustPosition(position, mapping);
  },
  getCurrentTiltPosition: (entity, agent) => {
    let position = attributes(entity).current_tilt_position;
    if (position == null) {
      const coverState = entity.state as CoverDeviceState;
      position =
        coverState === CoverDeviceState.closed
          ? 100
          : coverState === CoverDeviceState.open
            ? 0
            : undefined;
    }

    const bridgeDataProvider = agent.env.get(BridgeDataProvider);
    const mapping = getCoverMappingOptions(
      { entity_id: entity.entity_id, state: entity },
      bridgeDataProvider,
    );

    return adjustPosition(position, mapping);
  },
  getMovementStatus: (entity) => {
    const coverState = entity.state as CoverDeviceState;
    return coverState === CoverDeviceState.opening
      ? WindowCovering.MovementStatus.Opening
      : coverState === CoverDeviceState.closing
        ? WindowCovering.MovementStatus.Closing
        : WindowCovering.MovementStatus.Stopped;
  },

  stopCover: () => ({ action: "cover.stop_cover" }),

  openCoverLift: () => ({ action: "cover.open_cover" }),
  closeCoverLift: () => ({ action: "cover.close_cover" }),
  setLiftPosition: (position: number, agent: Agent) => {
    const homeAssistant = agent.get(HomeAssistantEntityBehavior);
    const entity = homeAssistant.entity.state;
    const bridgeDataProvider = agent.env.get(BridgeDataProvider);
    const mapping = getCoverMappingOptions(
      { entity_id: entity.entity_id, state: entity },
      bridgeDataProvider,
    );

    return {
      action: "cover.set_cover_position",
      data: { position: adjustPosition(position, mapping) },
    };
  },

  openCoverTilt: () => ({ action: "cover.open_cover_tilt" }),
  closeCoverTilt: () => ({ action: "cover.close_cover_tilt" }),
  setTiltPosition: (position: number, agent: Agent) => {
    const homeAssistant = agent.get(HomeAssistantEntityBehavior);
    const entity = homeAssistant.entity.state;
    const bridgeDataProvider = agent.env.get(BridgeDataProvider);
    const mapping = getCoverMappingOptions(
      { entity_id: entity.entity_id, state: entity },
      bridgeDataProvider,
    );

    return {
      action: "cover.set_cover_tilt_position",
      data: { tilt_position: adjustPosition(position, mapping) },
    };
  },
};

export const CoverWindowCoveringServer = WindowCoveringServer(config);
