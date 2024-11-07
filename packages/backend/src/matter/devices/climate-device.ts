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
import {
  ClusterComposer,
  ClusterType,
  Thermostat,
} from "@project-chip/matter.js/cluster";

type clusterType = ClusterType.Of<typeof Thermostat.Base>;
type FeatureSelection<T extends ClusterType> =
  ClusterComposer.FeatureSelection<T> extends readonly (infer R)[] ? R : never;

const ClimateDeviceType = ThermostatDevice.with(
  BasicInformationServer,
  IdentifyServer,
  HomeAssistantBehavior,
);

const coolingModes: ClimateHvacMode[] = [
  ClimateHvacMode.heat_cool,
  ClimateHvacMode.cool,
];
const heatingModes: ClimateHvacMode[] = [
  ClimateHvacMode.heat_cool,
  ClimateHvacMode.heat,
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
  const supportsAuto = entity.attributes.hvac_modes.includes(
    ClimateHvacMode.auto,
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
  return new MatterDevice(type, homeAssistant);
}
