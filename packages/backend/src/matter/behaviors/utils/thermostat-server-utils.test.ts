import { describe, expect, it } from "vitest";
import {
  ClimateHvacAction,
  ClimateHvacMode,
} from "@home-assistant-matter-hub/common";
import {
  getHvacModeFromMatter,
  getMatterRunningMode,
  getMatterRunningState,
  getMatterSystemMode,
  ThermostatRunningState,
  homeAssistantToMatterTemperature,
  matterToHomeAssistantTemperature,
} from "./thermostat-server-utils.js";
import { Thermostat } from "@matter/main/clusters";

describe("ThermostatServerUtils", () => {
  describe("getMatterRunningState", () => {
    const allOff: ThermostatRunningState = {
      cool: false,
      fan: false,
      heat: false,
      heatStage2: false,
      coolStage2: false,
      fanStage2: false,
      fanStage3: false,
    };

    it.each([
      [ClimateHvacAction.off, undefined, {}],
      [ClimateHvacAction.preheating, undefined, { heat: true }],
      [ClimateHvacAction.heating, undefined, { heat: true }],
      [ClimateHvacAction.cooling, undefined, { cool: true }],
      [ClimateHvacAction.drying, undefined, { heat: true, fan: true }],
      [ClimateHvacAction.fan, undefined, { fan: true }],
      [ClimateHvacAction.idle, undefined, {}],
      [ClimateHvacAction.defrosting, undefined, { heat: true }],
      [undefined, ClimateHvacMode.off, {}],
      [undefined, ClimateHvacMode.heat, { heat: true }],
      [undefined, ClimateHvacMode.cool, { cool: true }],
      [undefined, ClimateHvacMode.heat_cool, {}],
      [undefined, ClimateHvacMode.auto, {}],
      [undefined, ClimateHvacMode.dry, { heat: true, fan: true }],
      [undefined, ClimateHvacMode.fan_only, { fan: true }],
      [undefined, undefined, {}],
      [undefined, "unavailable", {}],
      [undefined, "any other string", {}],
    ])(
      "should map '%s' and '%s'",
      (hvacAction, hvacMode, expected: Partial<ThermostatRunningState>) => {
        expect(getMatterRunningState(hvacAction, hvacMode)).toEqual({
          ...allOff,
          ...expected,
        });
      },
    );
  });

  describe("getHvacModeFromMatter", () => {
    it.each([
      [Thermostat.SystemMode.Auto, ClimateHvacMode.heat_cool],
      [Thermostat.SystemMode.Precooling, ClimateHvacMode.cool],
      [Thermostat.SystemMode.Cool, ClimateHvacMode.cool],
      [Thermostat.SystemMode.Heat, ClimateHvacMode.heat],
      [Thermostat.SystemMode.EmergencyHeat, ClimateHvacMode.heat],
      [Thermostat.SystemMode.FanOnly, ClimateHvacMode.fan_only],
      [Thermostat.SystemMode.Dry, ClimateHvacMode.dry],
      [Thermostat.SystemMode.Sleep, ClimateHvacMode.off],
      [Thermostat.SystemMode.Off, ClimateHvacMode.off],
    ])("should map '%s' to '%s#'", (systemMode, hvacMode) => {
      expect(getHvacModeFromMatter(systemMode)).toEqual(hvacMode);
    });
  });

  describe("getMatterRunningMode", () => {
    it.each([
      [ClimateHvacAction.preheating, Thermostat.ThermostatRunningMode.Heat],
      [ClimateHvacAction.defrosting, Thermostat.ThermostatRunningMode.Heat],
      [ClimateHvacAction.heating, Thermostat.ThermostatRunningMode.Heat],
      [ClimateHvacAction.drying, Thermostat.ThermostatRunningMode.Heat],
      [ClimateHvacAction.cooling, Thermostat.ThermostatRunningMode.Cool],
      [ClimateHvacAction.fan, Thermostat.ThermostatRunningMode.Off],
      [ClimateHvacAction.idle, Thermostat.ThermostatRunningMode.Off],
      [ClimateHvacAction.off, Thermostat.ThermostatRunningMode.Off],
      [undefined, Thermostat.ThermostatRunningMode.Off],
    ])("should map '%s' to '%s'", (hvacAction, expected) => {
      expect(getMatterRunningMode(hvacAction)).toEqual(expected);
    });
  });

  describe("getMatterSystemMode", () => {
    it.each([
      [ClimateHvacMode.heat, Thermostat.SystemMode.Heat],
      [ClimateHvacMode.cool, Thermostat.SystemMode.Cool],
      [ClimateHvacMode.heat_cool, Thermostat.SystemMode.Auto],
      [ClimateHvacMode.auto, Thermostat.SystemMode.Auto],
      [ClimateHvacMode.dry, Thermostat.SystemMode.Dry],
      [ClimateHvacMode.fan_only, Thermostat.SystemMode.FanOnly],
      [ClimateHvacMode.off, Thermostat.SystemMode.Off],
      ["unavailable", Thermostat.SystemMode.Off],
      ["any other", Thermostat.SystemMode.Off],
    ])("should map '%s' to '%s'", (hvacMode, systemMode) => {
      expect(
        getMatterSystemMode(hvacMode, {
          autoMode: true,
          heating: true,
          cooling: true,
        }),
      ).toEqual(systemMode);
    });
  });

  describe("homeAssistantToMatterTemperature", () => {
    it.each([
      [100, "°C", 100_00],
      [85, "°C", 85_00],
      [294.15, "K", 21_00],
      [70, "°F", 21_11],
      [23.4581, "°C", 23_46],
      ["22.212", "°C", 22_21],
      ["not a number", "°C", undefined],
      [undefined, "°C", undefined],
      [null, "°C", undefined],
    ])("should convert '%s %s' to '%s'", (temperature, unit, expected) => {
      const actual = homeAssistantToMatterTemperature(temperature, unit);
      if (expected == undefined) {
        expect(actual).toBeUndefined();
      } else {
        expect(actual).approximately(expected, 0.01);
      }
    });
  });

  describe("matterToHomeAssistantTemperature", () => {
    it.each([
      [100_00, "°C", 100],
      [85_00, "°C", 85],
      [21_00, "K", 294.15],
      [21_11, "°F", 70],
      [23_46, "°C", 23.46],
      [undefined, "°C", undefined],
    ])("should convert '%s %s' to '%s'", (temperature, unit, expected) => {
      const actual = matterToHomeAssistantTemperature(temperature, unit);
      if (expected == undefined) {
        expect(actual).toBeUndefined();
      } else {
        expect(actual).approximately(expected, 0.01);
      }
    });
  });
});
