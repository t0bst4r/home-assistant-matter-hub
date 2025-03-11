import { ThermostatDevice } from "@matter/main/devices";
import { OnOffConfig, OnOffServer } from "../behaviors/on-off-server.js";
import { BasicInformationServer } from "../behaviors/basic-information-server.js";
import { IdentifyServer } from "../behaviors/identify-server.js";
import {
  ClimateDeviceAttributes,
  ClimateHvacMode,
  HomeAssistantEntityState,
} from "@home-assistant-matter-hub/common";
import { ThermostatServer } from "../behaviors/thermostat-server.js";
import { HomeAssistantEntityBehavior } from "../custom-behaviors/home-assistant-entity-behavior.js";
import {
  HumidityMeasurementConfig,
  HumidityMeasurementServer,
} from "../behaviors/humidity-measurement-server.js";
import { EndpointType } from "@matter/main";
import { FeatureSelection } from "../../utils/feature-selection.js";
import { Thermostat } from "@matter/main/clusters";
import { ClusterType } from "@matter/main/types";
import { InvalidDeviceError } from "../../utils/errors/invalid-device-error.js";

const climateOnOffConfig: OnOffConfig = {
   turnOn: { action: "climate.turn_on" },
   turnOff: { action: "climate.turn_off" },
};
const humidityConfig: HumidityMeasurementConfig = {
  getValue(entity: HomeAssistantEntityState) {
    const attributes = entity.attributes as ClimateDeviceAttributes;
    const humidity = attributes.current_humidity;
    if (humidity == null || isNaN(+humidity)) {
      return null;
    }
    return +humidity;
  },
};

function thermostatFeatures(
  supportsCooling: boolean,
  supportsHeating: boolean,
) {
  const features: FeatureSelection<ClusterType.Of<Thermostat.Complete>> =
    new Set();
  if (supportsCooling) {
    features.add("Cooling");
  }
  if (supportsHeating) {
    features.add("Heating");
  }
  if (supportsHeating && supportsCooling) {
    features.add("AutoMode");
  }
  return features;
}

const ClimateDeviceType = (
  supportsCooling: boolean,
  supportsHeating: boolean,
  supportsHumidity: boolean,
) => {
  const features = thermostatFeatures(supportsCooling, supportsHeating);
  if (features.size === 0) {
    throw new InvalidDeviceError(
      'Climates have to support either "heating" or "cooling". Just "auto" is not enough.',
    );
  }
  const device = ThermostatDevice.with(
    BasicInformationServer,
    IdentifyServer,
    HomeAssistantEntityBehavior,
    OnOffServer.set({ config: climateOnOffConfig }),
    ThermostatServer.with(...features),
  );

  if (supportsHumidity) {
    return device.with(
      HumidityMeasurementServer.set({ config: humidityConfig }),
    );
  } else {
    return device;
  }
};

const coolingModes: ClimateHvacMode[] = [
  ClimateHvacMode.heat_cool,
  ClimateHvacMode.cool,
];
const heatingModes: ClimateHvacMode[] = [
  ClimateHvacMode.heat_cool,
  ClimateHvacMode.heat,
];

export function ClimateDevice(
  homeAssistantEntity: HomeAssistantEntityBehavior.State,
): EndpointType {
  const attributes = homeAssistantEntity.entity.state
    .attributes as ClimateDeviceAttributes;
  const supportsCooling = coolingModes.some((mode) =>
    attributes.hvac_modes.includes(mode),
  );
  const supportsHeating = heatingModes.some((mode) =>
    attributes.hvac_modes.includes(mode),
  );
  const supportsHumidity = attributes.current_humidity !== undefined;

  return ClimateDeviceType(
    supportsCooling,
    supportsHeating,
    supportsHumidity,
  ).set({ homeAssistantEntity });
}
