import {
  VacuumDeviceFeature,
  VacuumState,
} from "@home-assistant-matter-hub/common";
import { RvcRunMode } from "@matter/main/clusters";
import { ServiceAreaBaseServer } from "@matter/node/behaviors";
import { LoggerService } from "../../../../environment/logger.js";
import { testBit } from "../../../../utils/test-bit.js";
import {
  RvcRunModeServer,
  RvcSupportedRunMode,
} from "../../../behaviors/rvc-run-mode-server.js";
import { ServiceAreaServer } from "../../../behaviors/service-area-server.js";
import { HomeAssistantEntityBehavior } from "../../../custom-behaviors/home-assistant-entity-behavior.js";

export const VacuumRvcRunModeServer = RvcRunModeServer({
  getCurrentMode: (entity) => {
    const state = entity.state as VacuumState;

    if (state === VacuumState.cleaning) {
      return RvcSupportedRunMode.Cleaning;
    }

    return RvcSupportedRunMode.Idle;
  },
  getSupportedModes: () => [
    {
      label: "Idle",
      mode: RvcSupportedRunMode.Idle,
      modeTags: [{ value: RvcRunMode.ModeTag.Idle }],
    },
    {
      label: "Cleaning",
      mode: RvcSupportedRunMode.Cleaning,
      modeTags: [{ value: RvcRunMode.ModeTag.Cleaning }],
    },
  ],

  start: (_, agent) => {
    const logger = agent.env.get(LoggerService).get("VacuumRvcRunModeServer");
    const serviceArea = agent.get(ServiceAreaBaseServer);

    if (
      Array.isArray(serviceArea.state.selectedAreas) &&
      serviceArea.state.selectedAreas.length > 0 &&
      Array.isArray(serviceArea.state.supportedMaps) &&
      serviceArea.state.supportedMaps.length > 0
    ) {
      logger.info(`starting room clean: ${serviceArea.state.selectedAreas}`);
      return {
        action: "tplink.clean_rooms",
        data: {
          room_ids: serviceArea.state.selectedAreas,
          map_id: serviceArea.state.supportedMaps[0].mapId,
        },
      };
    }

    return { action: "vacuum.start" };
  },
  returnToBase: () => ({ action: "vacuum.return_to_base" }),
  pause: (_, agent) => {
    const supportedFeatures =
      agent.get(HomeAssistantEntityBehavior).entity.state.attributes
        .supported_features ?? 0;
    if (testBit(supportedFeatures, VacuumDeviceFeature.PAUSE)) {
      return { action: "vacuum.pause" };
    }
    return { action: "vacuum.stop" };
  },
});
