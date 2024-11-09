import { TemperatureSensorDevice } from "@matter/main/devices";
import { BasicInformationServer } from "../../behaviors/basic-information-server.js";
import { IdentifyServer } from "../../behaviors/identify-server.js";
import {
  TemperatureMeasurementConfig,
  TemperatureMeasurementServer,
} from "../../behaviors/temperature-measurement-server.js";
import { HomeAssistantBehavior } from "../../custom-behaviors/home-assistant-behavior.js";
import {
  HomeAssistantEntityState,
  SensorDeviceAttributes,
} from "@home-assistant-matter-hub/common";

export const TemperatureSensorType = TemperatureSensorDevice.with(
  BasicInformationServer,
  IdentifyServer,
  HomeAssistantBehavior,
  TemperatureMeasurementServer,
);

export const temperatureSensorConfig: TemperatureMeasurementConfig = {
  getValue({ state }: HomeAssistantEntityState) {
    if (state == null || isNaN(+state)) {
      return null;
    }
    return +state;
  },
  getUnitOfMeasurement(
    state: HomeAssistantEntityState<SensorDeviceAttributes>,
  ) {
    return state.attributes.unit_of_measurement ?? null;
  },
};
