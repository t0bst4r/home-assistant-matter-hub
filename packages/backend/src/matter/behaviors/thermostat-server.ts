import type { HomeAssistantEntityInformation } from "@home-assistant-matter-hub/common";
import { ThermostatServer as Base } from "@matter/main/behaviors";
import { Thermostat } from "@matter/main/clusters";
import type { HomeAssistantAction } from "../../home-assistant/home-assistant-actions.js";
import { HomeAssistantConfig } from "../../home-assistant/home-assistant-config.js";
import { applyPatchState } from "../../utils/apply-patch-state.js";
import { Temperature } from "../../utils/converters/temperature.js";
import { HomeAssistantEntityBehavior } from "../custom-behaviors/home-assistant-entity-behavior.js";
import type { ValueGetter, ValueSetter } from "./utils/cluster-config.js";
import SystemMode = Thermostat.SystemMode;
import RunningMode = Thermostat.ThermostatRunningMode;
import type {
  Feature,
  FeatureSelection,
} from "../../utils/feature-selection.js";

const FeaturedBase = Base.with("Heating", "Cooling", "AutoMode");

export interface ThermostatRunningState {
  heat: boolean;
  cool: boolean;
  fan: boolean;
  heatStage2: false;
  coolStage2: false;
  fanStage2: false;
  fanStage3: false;
}

export interface ThermostatServerConfig {
  supportsTemperatureRange: ValueGetter<boolean>;
  getMinTemperature: ValueGetter<Temperature | undefined>;
  getMaxTemperature: ValueGetter<Temperature | undefined>;
  getCurrentTemperature: ValueGetter<Temperature | undefined>;
  getTargetHeatingTemperature: ValueGetter<Temperature | undefined>;
  getTargetCoolingTemperature: ValueGetter<Temperature | undefined>;

  getSystemMode: ValueGetter<SystemMode>;
  getRunningMode: ValueGetter<RunningMode>;

  setSystemMode: ValueSetter<SystemMode>;
  setTargetTemperature: ValueSetter<Temperature>;
  setTargetTemperatureRange: ValueSetter<{
    low: Temperature;
    high: Temperature;
  }>;
}

export class ThermostatServerBase extends FeaturedBase {
  declare state: ThermostatServerBase.State;

  override async initialize() {
    await super.initialize();

    const homeAssistant = await this.agent.load(HomeAssistantEntityBehavior);
    await this.env.load(HomeAssistantConfig);

    this.update(homeAssistant.entity);
    this.reactTo(this.events.systemMode$Changed, this.systemModeChanged, {
      offline: true,
    });
    if (this.features.cooling) {
      this.reactTo(
        this.events.occupiedCoolingSetpoint$Changed,
        this.coolingSetpointChanged,
        { offline: true },
      );
    }
    if (this.features.heating) {
      this.reactTo(
        this.events.occupiedHeatingSetpoint$Changed,
        this.heatingSetpointChanged,
        { offline: true },
      );
    }
    this.reactTo(homeAssistant.onChange, this.update);
  }

  private update(entity: HomeAssistantEntityInformation) {
    const config = this.state.config;
    const minSetpointLimit = config
      .getMinTemperature(entity.state, this.agent)
      ?.celsius(true);
    const maxSetpointLimit = config
      .getMaxTemperature(entity.state, this.agent)
      ?.celsius(true);
    const localTemperature = config
      .getCurrentTemperature(entity.state, this.agent)
      ?.celsius(true);
    const targetHeatingTemperature =
      config
        .getTargetHeatingTemperature(entity.state, this.agent)
        ?.celsius(true) ?? this.state.occupiedHeatingSetpoint;
    const targetCoolingTemperature =
      config
        .getTargetHeatingTemperature(entity.state, this.agent)
        ?.celsius(true) ?? this.state.occupiedCoolingSetpoint;

    const systemMode = this.getSystemMode(entity);
    const runningMode = config.getRunningMode(entity.state, this.agent);

    applyPatchState(this.state, {
      localTemperature: localTemperature,
      systemMode: systemMode,
      thermostatRunningState: this.getRunningState(systemMode, runningMode),
      controlSequenceOfOperation:
        this.features.cooling && this.features.heating
          ? Thermostat.ControlSequenceOfOperation.CoolingAndHeating
          : this.features.cooling
            ? Thermostat.ControlSequenceOfOperation.CoolingOnly
            : Thermostat.ControlSequenceOfOperation.HeatingOnly,
      ...(this.features.heating
        ? {
            occupiedHeatingSetpoint: targetHeatingTemperature,
            minHeatSetpointLimit: minSetpointLimit,
            maxHeatSetpointLimit: maxSetpointLimit,
            absMinHeatSetpointLimit: minSetpointLimit,
            absMaxHeatSetpointLimit: maxSetpointLimit,
          }
        : {}),
      ...(this.features.cooling
        ? {
            occupiedCoolingSetpoint: targetCoolingTemperature,
            minCoolSetpointLimit: minSetpointLimit,
            maxCoolSetpointLimit: maxSetpointLimit,
            absMinCoolSetpointLimit: minSetpointLimit,
            absMaxCoolSetpointLimit: maxSetpointLimit,
          }
        : {}),
      ...(this.features.autoMode
        ? {
            minSetpointDeadBand: 0,
            thermostatRunningMode: runningMode,
          }
        : {}),
    });
  }

  override async setpointRaiseLower(
    request: Thermostat.SetpointRaiseLowerRequest,
  ) {
    const config = this.state.config;
    const homeAssistant = this.agent.get(HomeAssistantEntityBehavior);
    const state = homeAssistant.entity.state;

    let cool = config.getTargetCoolingTemperature(state, this.agent);
    let heat = config.getTargetHeatingTemperature(state, this.agent);

    if (!heat && !cool) {
      return;
    }
    heat = (heat ?? cool)!;
    cool = (cool ?? heat)!;

    const adjustedCool =
      request.mode !== Thermostat.SetpointRaiseLowerMode.Heat
        ? cool.plus(request.amount / 1000, "°C")
        : cool;
    const adjustedHeat =
      request.mode !== Thermostat.SetpointRaiseLowerMode.Cool
        ? heat.plus(request.amount / 1000, "°C")
        : heat;
    await this.setTemperature(adjustedHeat, adjustedCool, request.mode);
  }

  private async heatingSetpointChanged(value: number) {
    const homeAssistant = this.agent.get(HomeAssistantEntityBehavior);
    const config = this.state.config;
    const entity = homeAssistant.entity;

    const next = Temperature.celsius(value / 100);
    if (!next) {
      return;
    }

    const current = config.getTargetHeatingTemperature(
      entity.state,
      this.agent,
    );

    if (next.equals(current)) {
      return;
    }

    await this.setTemperature(
      next,
      Temperature.celsius(this.state.occupiedCoolingSetpoint / 100)!,
      Thermostat.SetpointRaiseLowerMode.Heat,
    );
  }

  private async coolingSetpointChanged(value: number) {
    const homeAssistant = this.agent.get(HomeAssistantEntityBehavior);
    const config = this.state.config;
    const entity = homeAssistant.entity;

    const next = Temperature.celsius(value / 100);
    if (!next) {
      return;
    }

    const current = config.getTargetCoolingTemperature(
      entity.state,
      this.agent,
    );

    if (next.equals(current)) {
      return;
    }

    await this.setTemperature(
      Temperature.celsius(this.state.occupiedHeatingSetpoint / 100)!,
      next,
      Thermostat.SetpointRaiseLowerMode.Cool,
    );
  }

  private async setTemperature(
    low: Temperature,
    high: Temperature,
    mode: Thermostat.SetpointRaiseLowerMode,
  ) {
    const config = this.state.config;
    const homeAssistant = this.agent.get(HomeAssistantEntityBehavior);

    const supportsTemperatureRange = config.supportsTemperatureRange(
      homeAssistant.entity.state,
      this.agent,
    );

    let action: HomeAssistantAction;
    if (supportsTemperatureRange) {
      action = config.setTargetTemperatureRange({ low, high }, this.agent);
    } else {
      const both = mode === Thermostat.SetpointRaiseLowerMode.Heat ? low : high;
      action = config.setTargetTemperature(both, this.agent);
    }
    await homeAssistant.callAction(action);
  }

  private async systemModeChanged(systemMode: Thermostat.SystemMode) {
    const homeAssistant = this.agent.get(HomeAssistantEntityBehavior);
    const current = this.getSystemMode(homeAssistant.entity);
    if (systemMode === current) {
      return;
    }
    await homeAssistant.callAction(
      this.state.config.setSystemMode(systemMode, this.agent),
    );
  }

  private getSystemMode(entity: HomeAssistantEntityInformation) {
    let systemMode = this.state.config.getSystemMode(entity.state, this.agent);
    if (systemMode === Thermostat.SystemMode.Auto) {
      systemMode = this.features.autoMode
        ? SystemMode.Auto
        : this.features.heating
          ? SystemMode.Heat
          : this.features.cooling
            ? SystemMode.Cool
            : SystemMode.Sleep;
    }
    return systemMode;
  }

  private getRunningState(
    systemMode: SystemMode,
    runningMode: RunningMode,
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
    const heat = { ...allOff, heat: true };
    const cool = { ...allOff, cool: true };
    const dry = { ...allOff, heat: true, fan: true };
    const fanOnly = { ...allOff, fan: true };
    switch (systemMode) {
      case SystemMode.Heat:
      case SystemMode.EmergencyHeat:
        return heat;
      case SystemMode.Cool:
      case SystemMode.Precooling:
        return cool;
      case SystemMode.Dry:
        return dry;
      case SystemMode.FanOnly:
        return fanOnly;
      case SystemMode.Off:
      case SystemMode.Sleep:
        return allOff;
      case SystemMode.Auto:
        switch (runningMode) {
          case RunningMode.Heat:
            return heat;
          case RunningMode.Cool:
            return cool;
          case RunningMode.Off:
            return allOff;
        }
    }
  }
}

export namespace ThermostatServerBase {
  export class State extends FeaturedBase.State {
    config!: ThermostatServerConfig;
  }
}

export function ThermostatServer(config: ThermostatServerConfig) {
  const server = ThermostatServerBase.set({ config });
  return {
    with: (features: FeatureSelection<Thermostat.Complete>) =>
      server.with(...features),
  };
}
