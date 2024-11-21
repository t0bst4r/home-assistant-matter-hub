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
  HumidityMeasurementConfig,
  HumidityMeasurementServer,
} from "../behaviors/humidity-measurement-server.js";

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

const ClimateDeviceType = (
  supportsCooling: boolean,
  supportsHeating: boolean,
  supportsAuto: boolean,
  supportsHumidity: boolean,
) => {
  const thermostatServer = supportsAuto
    ? ThermostatServer.with("Cooling", "Heating", "AutoMode")
    : supportsCooling && supportsHeating
      ? ThermostatServer.with("Cooling", "Heating")
      : supportsCooling
        ? ThermostatServer.with("Cooling")
        : supportsHeating
          ? ThermostatServer.with("Heating")
          : ThermostatServer;

  const device = ThermostatDevice.with(
    BasicInformationServer,
    IdentifyServer,
    HomeAssistantBehavior,
    thermostatServer,
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
const autoModes: ClimateHvacMode[] = [
  ClimateHvacMode.heat_cool,
  ClimateHvacMode.auto,
];

export function ClimateDevice(
  homeAssistant: HomeAssistantBehavior.State,
): MatterDevice | undefined {
  const attributes = homeAssistant.entity.attributes as ClimateDeviceAttributes;
  const supportsCooling = coolingModes.some((mode) =>
    attributes.hvac_modes.includes(mode),
  );
  const supportsHeating = heatingModes.some((mode) =>
    attributes.hvac_modes.includes(mode),
  );
  const supportsAuto = autoModes.some((mode) =>
    attributes.hvac_modes.includes(mode),
  );
  const supportsHumidity = attributes.current_humidity !== undefined;

  return new MatterDevice(
    ClimateDeviceType(
      supportsCooling,
      supportsHeating,
      supportsAuto,
      supportsHumidity,
    ),
    homeAssistant,
  );
}
