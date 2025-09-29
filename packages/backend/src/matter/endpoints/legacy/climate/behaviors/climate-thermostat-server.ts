import {
  type ClimateDeviceAttributes,
  ClimateDeviceFeature,
  ClimateHvacAction,
  ClimateHvacMode,
  type HomeAssistantEntityState,
} from "@home-assistant-matter-hub/common";
import type { Agent } from "@matter/main";
import { Thermostat } from "@matter/main/clusters";
import { HomeAssistantConfig } from "../../../../../services/home-assistant/home-assistant-config.js";
import { Temperature } from "../../../../../utils/converters/temperature.js";
import { testBit } from "../../../../../utils/test-bit.js";
import {
  ThermostatServer,
  type ThermostatServerConfig,
} from "../../../../behaviors/thermostat-server.js";

const getUnit = (agent: Agent) =>
  agent.env.get(HomeAssistantConfig).unitSystem.temperature;
const attributes = (entity: HomeAssistantEntityState) =>
  <ClimateDeviceAttributes>entity.attributes;
const getTemp = (
  agent: Agent,
  entity: HomeAssistantEntityState,
  attributeName: keyof ClimateDeviceAttributes,
) => {
  const temperature = attributes(entity)[attributeName] as
    | string
    | number
    | null
    | undefined;
  const unit = getUnit(agent);
  if (temperature != null) {
    return Temperature.withUnit(+temperature, unit);
  }
};

const systemModeToHvacMode: Record<Thermostat.SystemMode, ClimateHvacMode> = {
  [Thermostat.SystemMode.Auto]: ClimateHvacMode.heat_cool,
  [Thermostat.SystemMode.Precooling]: ClimateHvacMode.cool,
  [Thermostat.SystemMode.Cool]: ClimateHvacMode.cool,
  [Thermostat.SystemMode.Heat]: ClimateHvacMode.heat,
  [Thermostat.SystemMode.EmergencyHeat]: ClimateHvacMode.heat,
  [Thermostat.SystemMode.FanOnly]: ClimateHvacMode.fan_only,
  [Thermostat.SystemMode.Dry]: ClimateHvacMode.dry,
  [Thermostat.SystemMode.Sleep]: ClimateHvacMode.off,
  [Thermostat.SystemMode.Off]: ClimateHvacMode.off,
};
const hvacActionToRunningMode: Record<
  ClimateHvacAction,
  Thermostat.ThermostatRunningMode
> = {
  [ClimateHvacAction.preheating]: Thermostat.ThermostatRunningMode.Heat,
  [ClimateHvacAction.defrosting]: Thermostat.ThermostatRunningMode.Heat,
  [ClimateHvacAction.heating]: Thermostat.ThermostatRunningMode.Heat,
  [ClimateHvacAction.drying]: Thermostat.ThermostatRunningMode.Heat,
  [ClimateHvacAction.cooling]: Thermostat.ThermostatRunningMode.Cool,
  [ClimateHvacAction.fan]: Thermostat.ThermostatRunningMode.Off,
  [ClimateHvacAction.idle]: Thermostat.ThermostatRunningMode.Off,
  [ClimateHvacAction.off]: Thermostat.ThermostatRunningMode.Off,
};
const hvacModeToSystemMode: Record<ClimateHvacMode, Thermostat.SystemMode> = {
  [ClimateHvacMode.heat]: Thermostat.SystemMode.Heat,
  [ClimateHvacMode.cool]: Thermostat.SystemMode.Cool,
  [ClimateHvacMode.auto]: Thermostat.SystemMode.Auto,
  [ClimateHvacMode.heat_cool]: Thermostat.SystemMode.Auto,
  [ClimateHvacMode.dry]: Thermostat.SystemMode.Dry,
  [ClimateHvacMode.fan_only]: Thermostat.SystemMode.FanOnly,
  [ClimateHvacMode.off]: Thermostat.SystemMode.Off,
};

const config: ThermostatServerConfig = {
  supportsTemperatureRange: (entity) =>
    testBit(
      entity.attributes.supported_features ?? 0,
      ClimateDeviceFeature.TARGET_TEMPERATURE_RANGE,
    ),
  getMinTemperature: (entity, agent) => getTemp(agent, entity, "min_temp"),
  getMaxTemperature: (entity, agent) => getTemp(agent, entity, "max_temp"),
  getCurrentTemperature: (entity, agent) =>
    getTemp(agent, entity, "current_temperature"),
  getTargetHeatingTemperature: (entity, agent) =>
    getTemp(agent, entity, "target_temp_low") ??
    getTemp(agent, entity, "target_temperature") ??
    getTemp(agent, entity, "temperature"),
  getTargetCoolingTemperature: (entity, agent) =>
    getTemp(agent, entity, "target_temp_high") ??
    getTemp(agent, entity, "target_temperature") ??
    getTemp(agent, entity, "temperature"),
  getSystemMode: (entity) =>
    hvacModeToSystemMode[entity.state as ClimateHvacMode] ??
    Thermostat.SystemMode.Off,
  getRunningMode: (entity) => {
    const action = attributes(entity).hvac_action;
    if (!action) {
      return Thermostat.ThermostatRunningMode.Off;
    }
    return (
      hvacActionToRunningMode[action] ?? Thermostat.ThermostatRunningMode.Off
    );
  },
  setSystemMode: (systemMode) => ({
    action: "climate.set_hvac_mode",
    data: {
      hvac_mode: systemModeToHvacMode[systemMode] ?? ClimateHvacMode.off,
    },
  }),
  setTargetTemperature: (value, agent) => ({
    action: "climate.set_temperature",
    data: {
      temperature: value.toUnit(getUnit(agent)),
    },
  }),
  setTargetTemperatureRange: ({ low, high }, agent) => ({
    action: "climate.set_temperature",
    data: {
      target_temp_low: low.toUnit(getUnit(agent)),
      target_temp_high: high.toUnit(getUnit(agent)),
    },
  }),
};
export const ClimateThermostatServer = ThermostatServer(config);
