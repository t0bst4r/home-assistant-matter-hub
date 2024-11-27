import { BasicInformationServer } from "../../behaviors/basic-information-server.js";
import { IdentifyServer } from "../../behaviors/identify-server.js";
import {
  HumidityMeasurementConfig,
  HumidityMeasurementServer,
} from "../../behaviors/humidity-measurement-server.js";
import { HumiditySensorDevice } from "@matter/main/devices";
import { HomeAssistantEntityBehavior } from "../../custom-behaviors/home-assistant-entity-behavior.js";
import { HomeAssistantEntityState } from "@home-assistant-matter-hub/common";

const humiditySensorConfig: HumidityMeasurementConfig = {
  getValue({ state }: HomeAssistantEntityState) {
    if (state == null || isNaN(+state)) {
      return null;
    }
    return +state;
  },
};

export const HumiditySensorType = HumiditySensorDevice.with(
  BasicInformationServer,
  IdentifyServer,
  HomeAssistantEntityBehavior,
  HumidityMeasurementServer.set({ config: humiditySensorConfig }),
);
