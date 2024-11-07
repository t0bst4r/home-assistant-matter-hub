import { ThermostatServer as Base } from "@project-chip/matter.js/behaviors/thermostat";
import { ClusterType, Thermostat } from "@project-chip/matter.js/cluster";
import { HomeAssistantBehavior } from "../custom-behaviors/home-assistant-behavior.js";
import {
  ClimateDeviceAttributes,
  ClimateHvacMode,
  HomeAssistantEntityState,
} from "@home-assistant-matter-hub/common";
import { Behavior } from "@project-chip/matter.js/behavior";
import _ from "lodash";

export class ThermostatServerBase extends Base.with(
  "Heating",
  "Cooling",
  "AutoMode",
) {
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

    Object.assign(this.state, {
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

      controlSequenceOfOperation:
        this.features.cooling && this.features.heating
          ? Thermostat.ControlSequenceOfOperation.CoolingAndHeating
          : this.features.cooling
            ? Thermostat.ControlSequenceOfOperation.CoolingOnly
            : Thermostat.ControlSequenceOfOperation.HeatingOnly,
    });

    this.events.occupiedHeatingSetpoint$Changed.on(
      this.targetTemperatureChanged.bind(this),
    );
    this.events.systemMode$Changed.on(this.systemModeChanged.bind(this));
    homeAssistant.onUpdate((s) => this.update(s));
  }

  private async update(state: HomeAssistantEntityState) {
    Object.assign(
      this.internal,
      this.getState(state as HomeAssistantEntityState<ClimateDeviceAttributes>),
    );
    const actualState = this.endpoint.stateOf(ThermostatServerBase);

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

    if (_.size(patch) > 0) {
      await this.endpoint.setStateOf(ThermostatServerBase, patch);
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
      systemMode: this.getSystemMode(entity.state),
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

  private getSystemMode(state: string | undefined): Thermostat.SystemMode {
    switch (state ?? "off") {
      case "heat":
        return Thermostat.SystemMode.Heat;
      case "cool":
        return Thermostat.SystemMode.Cool;
    }
    return Thermostat.SystemMode.Off;
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
  export class Internal {
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
