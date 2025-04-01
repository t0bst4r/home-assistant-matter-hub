import type {
  HomeAssistantEntityState,
  SensorDeviceAttributes,
} from "@home-assistant-matter-hub/common";
import { TemperatureSensorDevice } from "@matter/main/devices";
import { BasicInformationServer } from "../../behaviors/basic-information-server.js";
import { IdentifyServer } from "../../behaviors/identify-server.js";
import {
  type TemperatureMeasurementConfig,
  TemperatureMeasurementServer,
} from "../../behaviors/temperature-measurement-server.js";
import { HomeAssistantEntityBehavior } from "../../custom-behaviors/home-assistant-entity-behavior.js";

const temperatureSensorConfig: TemperatureMeasurementConfig = {
  getValue({ state }: HomeAssistantEntityState) {
    if (state == null || Number.isNaN(+state)) {
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

export const TemperatureSensorType = TemperatureSensorDevice.with(
  BasicInformationServer,
  IdentifyServer,
  HomeAssistantEntityBehavior,
  TemperatureMeasurementServer.set({ config: temperatureSensorConfig }),
);
