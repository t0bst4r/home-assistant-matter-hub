import {
  type ClimateDeviceAttributes,
  ClimateDeviceFeature,
  ClimateHvacMode,
} from "@home-assistant-matter-hub/common";
import type { ClusterBehavior, EndpointType } from "@matter/main";
import type { Thermostat } from "@matter/main/clusters";
import { ThermostatDevice } from "@matter/main/devices";
import type { ClusterType } from "@matter/main/types";
import { InvalidDeviceError } from "../../../../utils/errors/invalid-device-error.js";
import type { FeatureSelection } from "../../../../utils/feature-selection.js";
import { testBit } from "../../../../utils/test-bit.js";
import { BasicInformationServer } from "../../../behaviors/basic-information-server.js";
import { HomeAssistantEntityBehavior } from "../../../behaviors/home-assistant-entity-behavior.js";
import { IdentifyServer } from "../../../behaviors/identify-server.js";
import { ClimateHumidityMeasurementServer } from "./behaviors/climate-humidity-measurement-server.js";
import { ClimateOnOffServer } from "./behaviors/climate-on-off-server.js";
import { ClimateThermostatServer } from "./behaviors/climate-thermostat-server.js";

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
    additionalClusters.push(ClimateOnOffServer);
  }
  if (supportsHumidity) {
    additionalClusters.push(ClimateHumidityMeasurementServer);
  }

  return ThermostatDevice.with(
    BasicInformationServer,
    IdentifyServer,
    HomeAssistantEntityBehavior,
    ClimateThermostatServer.with(...features),
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
