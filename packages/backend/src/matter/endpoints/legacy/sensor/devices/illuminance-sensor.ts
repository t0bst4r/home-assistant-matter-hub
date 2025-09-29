import type { HomeAssistantEntityState } from "@home-assistant-matter-hub/common";
import { LightSensorDevice } from "@matter/main/devices";
import { BasicInformationServer } from "../../../../behaviors/basic-information-server.js";
import { HomeAssistantEntityBehavior } from "../../../../behaviors/home-assistant-entity-behavior.js";
import { IdentifyServer } from "../../../../behaviors/identify-server.js";
import {
  type IlluminanceMeasurementConfig,
  IlluminanceMeasurementServer,
} from "../../../../behaviors/illuminance-measurement-server.js";

const illuminanceSensorConfig: IlluminanceMeasurementConfig = {
  getValue({ state }: HomeAssistantEntityState) {
    if (state == null || Number.isNaN(+state)) {
      return null;
    }
    return +state;
  },
};

export const IlluminanceSensorType = LightSensorDevice.with(
  BasicInformationServer,
  IdentifyServer,
  HomeAssistantEntityBehavior,
  IlluminanceMeasurementServer(illuminanceSensorConfig),
);
