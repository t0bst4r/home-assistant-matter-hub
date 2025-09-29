import type { HomeAssistantEntityState } from "@home-assistant-matter-hub/common";
import { HumiditySensorDevice } from "@matter/main/devices";
import { BasicInformationServer } from "../../../../behaviors/basic-information-server.js";
import { HomeAssistantEntityBehavior } from "../../../../behaviors/home-assistant-entity-behavior.js";
import {
  type HumidityMeasurementConfig,
  HumidityMeasurementServer,
} from "../../../../behaviors/humidity-measurement-server.js";
import { IdentifyServer } from "../../../../behaviors/identify-server.js";

const humiditySensorConfig: HumidityMeasurementConfig = {
  getValue({ state }: HomeAssistantEntityState) {
    if (state == null || Number.isNaN(+state)) {
      return null;
    }
    return +state;
  },
};

export const HumiditySensorType = HumiditySensorDevice.with(
  BasicInformationServer,
  IdentifyServer,
  HomeAssistantEntityBehavior,
  HumidityMeasurementServer(humiditySensorConfig),
);
