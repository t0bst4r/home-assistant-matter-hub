import { MatterDevice } from "../matter-device.js";
import { ThermostatDevice } from "@project-chip/matter.js/devices/ThermostatDevice";
import { BasicInformationServer } from "../behaviors/basic-information-server.js";
import { IdentifyServer } from "../behaviors/identify-server.js";
import {
  ClimateDeviceAttributes,
  ClimateHvacMode,
  HomeAssistantEntityState,
} from "@home-assistant-matter-hub/common";
import { ThermostatServer } from "../behaviors/thermostat-server.js";
import { HomeAssistantBehavior } from "../custom-behaviors/home-assistant-behavior.js";

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
  const thermostat = ThermostatServer(supportsCooling, supportsHeating);
  if (!thermostat) {
    return undefined;
  }
  const type = ClimateDeviceType.with(thermostat);
  return new MatterDevice(type, homeAssistant);
}
