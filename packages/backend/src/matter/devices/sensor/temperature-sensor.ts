import { TemperatureSensorDevice } from "@project-chip/matter.js/devices/TemperatureSensorDevice";
import { BasicInformationServer } from "../../behaviors/basic-information-server.js";
import { IdentifyServer } from "../../behaviors/identify-server.js";
import { TemperatureMeasurementServer } from "../../behaviors/temperature-measurement-server.js";
import { HomeAssistantBehavior } from "../../custom-behaviors/home-assistant-behavior.js";

export const TemperatureSensorType = TemperatureSensorDevice.with(
  BasicInformationServer,
  IdentifyServer,
  HomeAssistantBehavior,
  TemperatureMeasurementServer,
);
