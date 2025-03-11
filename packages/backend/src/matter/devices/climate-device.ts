import { ThermostatDevice } from "@matter/main/devices";
import { OnOffConfig, OnOffServer } from "../behaviors/on-off-server.js";
import { BasicInformationServer } from "../behaviors/basic-information-server.js";
import { IdentifyServer } from "../behaviors/identify-server.js";
import {
  ClimateDeviceAttributes,
  ClimateDeviceFeature,
  ClimateHvacMode,
  HomeAssistantEntityState,
} from "@home-assistant-matter-hub/common";
import { ThermostatServer } from "../behaviors/thermostat-server.js";
import { HomeAssistantEntityBehavior } from "../custom-behaviors/home-assistant-entity-behavior.js";
import {
  HumidityMeasurementConfig,
  HumidityMeasurementServer,
} from "../behaviors/humidity-measurement-server.js";
import { EndpointType, ClusterBehavior } from "@matter/main";
import { FeatureSelection } from "../../utils/feature-selection.js";
import { Thermostat } from "@matter/main/clusters";
import { ClusterType } from "@matter/main/types";
import { InvalidDeviceError } from "../../utils/errors/invalid-device-error.js";
import { testBit } from "../../utils/test-bit.js";

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
  supportsOnOff: boolean,
  supportsHumidity: boolean,
) => {
  const features = thermostatFeatures(supportsCooling, supportsHeating);
  if (features.size === 0) {
    throw new InvalidDeviceError(
      'Climates have to support either "heating" or "cooling". Just "auto" is not enough.',
    );
  }

  const additionalClusters: ClusterBehavior.Type[] = [];

  if (supportsOnOff) {
    additionalClusters.push(OnOffServer.set({ config: climateOnOffConfig }));
  }

  if (supportsHumidity) {
    additionalClusters.push(
      HumidityMeasurementServer.set({ config: humidityConfig }),
    );
  }

  return ThermostatDevice.with(
    BasicInformationServer,
    IdentifyServer,
    HomeAssistantEntityBehavior,
    ThermostatServer.with(...features),
    ...additionalClusters,
  );
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
  const supportedFeatures = attributes.supported_features ?? 0;

  const supportsCooling = coolingModes.some((mode) =>
    attributes.hvac_modes.includes(mode),
  );
  const supportsHeating = heatingModes.some((mode) =>
    attributes.hvac_modes.includes(mode),
  );
  const supportsHumidity = testBit(
    supportedFeatures,
    ClimateDeviceFeature.TARGET_HUMIDITY,
  );
  const supportsOnOff =
    testBit(supportedFeatures, ClimateDeviceFeature.TURN_ON) &&
    testBit(supportedFeatures, ClimateDeviceFeature.TURN_OFF);

  return ClimateDeviceType(
    supportsCooling,
    supportsHeating,
    supportsOnOff,
    supportsHumidity,
  ).set({ homeAssistantEntity });
}
