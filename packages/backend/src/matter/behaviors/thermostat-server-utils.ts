import {
  ClimateHvacAction,
  ClimateHvacMode,
} from "@home-assistant-matter-hub/common";
import { Thermostat } from "@matter/main/clusters";

export interface ThermostatFeatures {
  autoMode: boolean;
  heating: boolean;
  cooling: boolean;
}

export interface ThermostatRunningState {
  heat: boolean;
  cool: boolean;
  fan: boolean;
  heatStage2: false;
  coolStage2: false;
  fanStage2: false;
  fanStage3: false;
}

/**
 * Convert the current hvac action to the matter running state.
 * It uses hvacMode as fallback.
 * @param hvacAction
 * @param hvacMode
 */
export function getMatterRunningState(
  hvacAction: ClimateHvacAction | undefined,
  hvacMode: ClimateHvacMode | "unavailable" | string | undefined,
): ThermostatRunningState {
  const allOff: ThermostatRunningState = {
    cool: false,
    fan: false,
    heat: false,
    heatStage2: false,
    coolStage2: false,
    fanStage2: false,
    fanStage3: false,
  };
  switch (hvacAction ?? hvacMode) {
    case ClimateHvacAction.preheating:
    case ClimateHvacAction.defrosting:
    case ClimateHvacAction.heating:
    case ClimateHvacMode.heat:
      return { ...allOff, heat: true };
    case ClimateHvacAction.cooling:
    case ClimateHvacMode.cool:
      return { ...allOff, cool: true };
    case ClimateHvacAction.drying:
    case ClimateHvacMode.dry:
      return { ...allOff, heat: true, fan: true };
    case ClimateHvacAction.fan:
    case ClimateHvacMode.fan_only:
      return { ...allOff, fan: true };
    case ClimateHvacAction.idle:
    case ClimateHvacAction.off:
    case ClimateHvacMode.heat_cool:
    case ClimateHvacMode.auto:
    case ClimateHvacMode.off:
    case "unavailable":
    default:
    case undefined:
      return allOff;
  }
}

/**
 * Convert the matter system mode to HA hvac mode
 * @param systemMode
 */
export function getHvacModeFromMatter(
  systemMode: Thermostat.SystemMode,
): ClimateHvacMode {
  switch (systemMode) {
    case Thermostat.SystemMode.Auto:
      return ClimateHvacMode.heat_cool;
    case Thermostat.SystemMode.Precooling:
    case Thermostat.SystemMode.Cool:
      return ClimateHvacMode.cool;
    case Thermostat.SystemMode.Heat:
    case Thermostat.SystemMode.EmergencyHeat:
      return ClimateHvacMode.heat;
    case Thermostat.SystemMode.FanOnly:
      return ClimateHvacMode.fan_only;
    case Thermostat.SystemMode.Dry:
      return ClimateHvacMode.dry;
    case Thermostat.SystemMode.Sleep:
    case Thermostat.SystemMode.Off:
      return ClimateHvacMode.off;
  }
}

/**
 * Convert the hvac Action to the matter running mode
 * @param hvacAction
 */
export function getMatterRunningMode(
  hvacAction: ClimateHvacAction | undefined,
): Thermostat.ThermostatRunningMode {
  switch (hvacAction) {
    case ClimateHvacAction.preheating:
    case ClimateHvacAction.defrosting:
    case ClimateHvacAction.heating:
    case ClimateHvacAction.drying:
      return Thermostat.ThermostatRunningMode.Heat;
    case ClimateHvacAction.cooling:
      return Thermostat.ThermostatRunningMode.Cool;
    case ClimateHvacAction.fan:
    case ClimateHvacAction.idle:
    case ClimateHvacAction.off:
    case undefined:
      return Thermostat.ThermostatRunningMode.Off;
  }
}

/**
 * Get the matter system mode from the hvac mode
 * @param hvacMode
 * @param features
 */
export function getMatterSystemMode(
  hvacMode: ClimateHvacMode | "unavailable" | string,
  features: ThermostatFeatures,
): Thermostat.SystemMode {
  switch (hvacMode) {
    case ClimateHvacMode.heat:
      return Thermostat.SystemMode.Heat;
    case ClimateHvacMode.cool:
      return Thermostat.SystemMode.Cool;
    case ClimateHvacMode.auto:
    case ClimateHvacMode.heat_cool:
      return features.autoMode
        ? Thermostat.SystemMode.Auto
        : features.heating
          ? Thermostat.SystemMode.Heat
          : features.cooling
            ? Thermostat.SystemMode.Cool
            : Thermostat.SystemMode.Sleep;
    case ClimateHvacMode.dry:
      return Thermostat.SystemMode.Dry;
    case ClimateHvacMode.fan_only:
      return Thermostat.SystemMode.FanOnly;
    case ClimateHvacMode.off:
    case "unavailable":
      return Thermostat.SystemMode.Off;
  }
  return Thermostat.SystemMode.Off;
}

/**
 * Convert the temperature from home assistant to matter compatible values
 * @param value
 */
export function toMatterTemperature(
  value: number | string | null | undefined,
): number | undefined {
  const current = value != null ? +value : null;
  if (current == null || isNaN(current)) {
    return undefined;
  } else {
    return Math.round(current * 100);
  }
}
