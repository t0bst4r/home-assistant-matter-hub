import {
  VacuumDeviceFeature,
  VacuumState,
} from "@home-assistant-matter-hub/common";
import { RvcOperationalState } from "@matter/main/clusters";
import { testBit } from "../../../../../utils/test-bit.js";
import { HomeAssistantEntityBehavior } from "../../../../behaviors/home-assistant-entity-behavior.js";
import { RvcOperationalStateServer } from "../../../../behaviors/rvc-operational-state-server.js";

export const VacuumRvcOperationalStateServer = RvcOperationalStateServer({
  getOperationalState(entity): RvcOperationalState.OperationalState {
    const state = entity.state as VacuumState | "unavailable";
    switch (state) {
      case VacuumState.docked:
        return RvcOperationalState.OperationalState.Docked;
      case VacuumState.returning:
        return RvcOperationalState.OperationalState.SeekingCharger;
      case VacuumState.cleaning:
        return RvcOperationalState.OperationalState.Running;
      case VacuumState.paused:
      case VacuumState.idle:
        return RvcOperationalState.OperationalState.Paused;
      default:
        return RvcOperationalState.OperationalState.Error;
    }
  },
  pause: (_, agent) => {
    const supportedFeatures =
      agent.get(HomeAssistantEntityBehavior).entity.state.attributes
        .supported_features ?? 0;
    if (testBit(supportedFeatures, VacuumDeviceFeature.PAUSE)) {
      return { action: "vacuum.pause" };
    }
    return { action: "vacuum.stop" };
  },
  resume: () => ({
    action: "vacuum.start",
  }),
});
