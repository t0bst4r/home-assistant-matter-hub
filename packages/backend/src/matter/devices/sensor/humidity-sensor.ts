import { BasicInformationServer } from "../../behaviors/basic-information-server.js";
import { IdentifyServer } from "../../behaviors/identify-server.js";
import { HumiditySensorDevice } from "@project-chip/matter.js/devices/HumiditySensorDevice";
import { HumidityMeasurementServer } from "../../behaviors/humidity-measurement-server.js";
import { HomeAssistantBehavior } from "../../custom-behaviors/home-assistant-behavior.js";

export const HumiditySensorType = HumiditySensorDevice.with(
  BasicInformationServer,
  IdentifyServer,
  HomeAssistantBehavior,
  HumidityMeasurementServer,
);
