import { MatterDevice } from "../matter-device.js";
import { ThermostatDevice } from "@matter/main/devices";
import { BasicInformationServer } from "../behaviors/basic-information-server.js";
import { IdentifyServer } from "../behaviors/identify-server.js";
import {
  ClimateDeviceAttributes,
  ClimateHvacMode,
  HomeAssistantEntityState,
} from "@home-assistant-matter-hub/common";
import { ThermostatServer } from "../behaviors/thermostat-server.js";
import { HomeAssistantBehavior } from "../custom-behaviors/home-assistant-behavior.js";
import { Thermostat } from "@matter/main/clusters";
import { ClusterComposer, ClusterType } from "@matter/main/types";
import { HumidityMeasurementServer } from "../behaviors/humidity-measurement-server.js";
import { TemperatureMeasurementServer } from "../behaviors/temperature-measurement-server.js";

type clusterType = ClusterType.Of<typeof Thermostat.Base>;
type FeatureSelection<T extends ClusterType> =
  ClusterComposer.FeatureSelection<T> extends readonly (infer R)[] ? R : never;

const ClimateDeviceType = ThermostatDevice.with(
  BasicInformationServer,
  IdentifyServer,
  HomeAssistantBehavior,
  HumidityMeasurementServer,
  TemperatureMeasurementServer,
);

const coolingModes: ClimateHvacMode[] = [
  ClimateHvacMode.heat_cool,
  ClimateHvacMode.cool,
];
const heatingModes: ClimateHvacMode[] = [
  ClimateHvacMode.heat_cool,
  ClimateHvacMode.heat,
];
const autoModes: ClimateHvacMode[] = [
  ClimateHvacMode.heat_cool,
  ClimateHvacMode.auto,
];

export function ClimateDevice(
  homeAssistant: HomeAssistantBehavior.State,
): MatterDevice | undefined {
  const entity =
    homeAssistant.entity as HomeAssistantEntityState<ClimateDeviceAttributes>;
  const supportsCooling = coolingModes.some((mode) =>
    entity.attributes.hvac_modes.includes(mode),
  );
  const supportsHeating = heatingModes.some((mode) =>
    entity.attributes.hvac_modes.includes(mode),
  );
  const supportsAuto = autoModes.some((mode) =>
    entity.attributes.hvac_modes.includes(mode),
  );

  const featureSelection: FeatureSelection<clusterType>[] = [];
  if (supportsCooling || supportsAuto) {
    featureSelection.push("Cooling");
  }
  if (supportsHeating || supportsAuto) {
    featureSelection.push("Heating");
  }
  if (supportsAuto) {
    featureSelection.push("AutoMode");
  }

  const type = ClimateDeviceType.with(
    ThermostatServer.with(...featureSelection),
  );
  return new MatterDevice(type, homeAssistant, {
    relativeHumidityMeasurement: {
      config: {
        getValue(entity: HomeAssistantEntityState) {
          const attributes = entity.attributes as ClimateDeviceAttributes;
          const humidity = attributes.current_humidity;
          if (humidity == null || isNaN(+humidity)) {
            return null;
          }
          return +humidity;
        },
      },
    },
    temperatureMeasurement: {
      config: {
        getValue(entity: HomeAssistantEntityState) {
          const attributes = entity.attributes as ClimateDeviceAttributes;
          const temperature = attributes.current_temperature;
          if (temperature == null || isNaN(+temperature)) {
            return null;
          }
          return +temperature;
        },
      },
    },
  });
}
