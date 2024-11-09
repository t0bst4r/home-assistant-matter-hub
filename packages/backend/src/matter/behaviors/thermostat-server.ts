import { ThermostatServer as Base } from "@matter/main/behaviors";
import { Thermostat } from "@matter/main/clusters";
import { HomeAssistantBehavior } from "../custom-behaviors/home-assistant-behavior.js";
import {
  ClimateDeviceAttributes,
  ClimateHvacAction,
  ClimateHvacMode,
  HomeAssistantEntityState,
} from "@home-assistant-matter-hub/common";
import { Behavior } from "@matter/main";
import _ from "lodash";
import { ClusterType } from "@matter/main/types";

const FeaturedBase = Base.with("Heating", "Cooling", "AutoMode");

export class ThermostatServerBase extends FeaturedBase {
  declare state: ThermostatServerBase.State;
  declare internal: ThermostatServerBase.Internal;

  override async initialize() {
    await super.initialize();
    const homeAssistant = await this.agent.load(HomeAssistantBehavior);
    Object.assign(
      this.internal,
      this.getState(
        homeAssistant.state
          .entity as HomeAssistantEntityState<ClimateDeviceAttributes>,
      ),
    );

    const updatedState: Partial<ThermostatServerBase.State> = {
      localTemperature: this.internal.currentTemperature,
      systemMode: this.internal.systemMode,
      ...(this.features.heating
        ? {
            occupiedHeatingSetpoint: this.internal.targetTemperature,
            minHeatSetpointLimit: this.internal.minTemperature,
            maxHeatSetpointLimit: this.internal.maxTemperature,
          }
        : {}),
      ...(this.features.cooling
        ? {
            occupiedCoolingSetpoint: this.internal.targetTemperature,
            minCoolSetpointLimit: this.internal.minTemperature,
            maxCoolSetpointLimit: this.internal.maxTemperature,
          }
        : {}),
      ...(this.features.autoMode
        ? {
            thermostatRunningMode: this.internal.runningMode,
            minSetpointDeadBand: 0,
          }
        : {}),

      controlSequenceOfOperation:
        this.features.cooling && this.features.heating
          ? Thermostat.ControlSequenceOfOperation.CoolingAndHeating
          : this.features.cooling
            ? Thermostat.ControlSequenceOfOperation.CoolingOnly
            : Thermostat.ControlSequenceOfOperation.HeatingOnly,
    };

    Object.assign(this.state, updatedState);

    if (this.features.heating) {
      this.events.occupiedHeatingSetpoint$Changed.on(
        this.targetTemperatureChanged.bind(this),
      );
    }
    if (this.features.cooling) {
      this.events.occupiedCoolingSetpoint$Changed.on(
        this.targetTemperatureChanged.bind(this),
      );
    }
    this.events.systemMode$Changed.on(this.systemModeChanged.bind(this));
    homeAssistant.onUpdate((s) => this.update(s));
  }

  private async update(state: HomeAssistantEntityState) {
    Object.assign(
      this.internal,
      this.getState(state as HomeAssistantEntityState<ClimateDeviceAttributes>),
    );
    const actualState = this.endpoint.stateOf(
      ThermostatServer,
    ) as Partial<ThermostatServerBase.State>;
    const patch: Behavior.PatchStateOf<typeof ThermostatServerBase> = {};

    if (
      this.internal.currentTemperature != null &&
      this.internal.currentTemperature !== actualState.localTemperature
    ) {
      patch.localTemperature = this.internal.currentTemperature;
    }
    if (this.internal.systemMode !== actualState.systemMode) {
      patch.systemMode = this.internal.systemMode;
    }

    if (this.features.heating) {
      if (
        this.internal.targetTemperature !== actualState.occupiedHeatingSetpoint
      ) {
        patch.occupiedHeatingSetpoint = this.internal.targetTemperature;
      }
    }

    if (this.features.cooling) {
      if (
        this.internal.targetTemperature !== actualState.occupiedCoolingSetpoint
      ) {
        patch.occupiedCoolingSetpoint = this.internal.targetTemperature;
      }
    }

    if (this.features.autoMode) {
      if (this.internal.runningMode !== actualState.thermostatRunningMode) {
        patch.thermostatRunningMode = this.internal.runningMode;
      }
    }

    if (_.size(patch) > 0) {
      await this.endpoint.setStateOf(ThermostatServer, patch);
    }
  }

  override async setpointRaiseLower(
    request: Thermostat.SetpointRaiseLowerRequest,
  ) {
    const homeAssistant = this.agent.get(HomeAssistantBehavior);
    const targetTemperature = this.internal?.targetTemperature;
    if (targetTemperature == null) {
      return;
    }
    await super.setpointRaiseLower(request);
    const temperature = targetTemperature / 100 + request.amount / 10;
    await homeAssistant.callAction(
      "climate",
      "set_temperature",
      { temperature },
      { entity_id: homeAssistant.state.entity.entity_id },
    );
  }

  private async targetTemperatureChanged(value: number) {
    const homeAssistant = this.agent.get(HomeAssistantBehavior);
    if (value === this.internal?.targetTemperature) {
      return;
    }
    await homeAssistant.callAction(
      "climate",
      "set_temperature",
      { temperature: value / 100 },
      { entity_id: homeAssistant.state.entity.entity_id },
    );
  }

  private async systemModeChanged(systemMode: Thermostat.SystemMode) {
    const homeAssistant = this.agent.get(HomeAssistantBehavior);
    if (systemMode === this.internal?.systemMode) {
      return;
    }
    await homeAssistant.callAction(
      "climate",
      "set_hvac_mode",
      { hvac_mode: this.getHvacMode(systemMode) },
      { entity_id: homeAssistant.state.entity.entity_id },
    );
  }

  private getState(
    entity: HomeAssistantEntityState<ClimateDeviceAttributes>,
  ): ThermostatServerBase.Internal {
    return {
      runningMode: this.getRunningState(entity.attributes.hvac_action),
      systemMode: this.getSystemMode(
        entity.attributes.hvac_mode,
        entity.attributes.hvac_action,
      ),
      minTemperature:
        this.getTemperature(entity.attributes.min_temp) ?? undefined,
      maxTemperature:
        this.getTemperature(entity.attributes.max_temp) ?? undefined,
      currentTemperature: this.getTemperature(
        entity.attributes.current_temperature,
      ),
      targetTemperature:
        this.getTemperature(entity.attributes.temperature) ?? 2100,
    };
  }

  private getRunningState(hvacAction: ClimateHvacAction | undefined) {
    switch (hvacAction) {
      case ClimateHvacAction.preheating:
      case ClimateHvacAction.heating:
        return Thermostat.ThermostatRunningMode.Heat;
      case ClimateHvacAction.defrosting:
      case ClimateHvacAction.cooling:
        return Thermostat.ThermostatRunningMode.Cool;
      default:
        return Thermostat.ThermostatRunningMode.Off;
    }
  }

  private getSystemMode(
    hvacMode: ClimateHvacMode | undefined,
    hvacAction: ClimateHvacAction | undefined,
  ): Thermostat.SystemMode {
    switch (hvacMode) {
      case ClimateHvacMode.heat:
        return Thermostat.SystemMode.Heat;
      case ClimateHvacMode.cool:
        return Thermostat.SystemMode.Cool;
      case ClimateHvacMode.heat_cool:
      case ClimateHvacMode.auto:
        return Thermostat.SystemMode.Auto;
      case ClimateHvacMode.dry:
        return Thermostat.SystemMode.Dry;
      case ClimateHvacMode.fan_only:
        return Thermostat.SystemMode.FanOnly;
      case ClimateHvacMode.off:
        return Thermostat.SystemMode.Off;
    }
    const runningState = this.getRunningState(hvacAction);
    switch (runningState) {
      case Thermostat.ThermostatRunningMode.Heat:
        return Thermostat.SystemMode.Heat;
      case Thermostat.ThermostatRunningMode.Cool:
        return Thermostat.SystemMode.Cool;
      case Thermostat.ThermostatRunningMode.Off:
        return Thermostat.SystemMode.Off;
    }
  }

  private getHvacMode(systemMode: Thermostat.SystemMode): ClimateHvacMode {
    switch (systemMode) {
      case Thermostat.SystemMode.Cool:
        return ClimateHvacMode.cool;
      case Thermostat.SystemMode.Heat:
        return ClimateHvacMode.heat;
      default:
        return ClimateHvacMode.off;
    }
  }

  private getTemperature(
    value: number | string | null | undefined,
  ): number | null {
    const current = value != null ? +value : null;
    if (current == null || isNaN(current)) {
      return null;
    } else {
      return current * 100;
    }
  }
}

export namespace ThermostatServerBase {
  export class State extends FeaturedBase.State {}

  export class Internal {
    runningMode!: Thermostat.ThermostatRunningMode;
    systemMode!: Thermostat.SystemMode;
    minTemperature!: number | undefined;
    maxTemperature!: number | undefined;
    targetTemperature!: number;
    currentTemperature!: number | null;
  }
}

export class ThermostatServer extends ThermostatServerBase.for(
  ClusterType(Thermostat.Base),
) {}
