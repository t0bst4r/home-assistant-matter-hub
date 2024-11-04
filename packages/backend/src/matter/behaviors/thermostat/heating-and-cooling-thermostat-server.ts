import { ThermostatServer as Base } from "@project-chip/matter.js/behaviors/thermostat";
import { ThermostatBaseServer } from "./thermostat-base-server.js";
import { HomeAssistantEntityState } from "@home-assistant-matter-hub/common";
import { Behavior } from "@project-chip/matter.js/behavior";
import { Thermostat } from "@project-chip/matter.js/cluster";

export class HeatingAndCoolingThermostatServer extends ThermostatBaseServer(
  Base.with("Heating", "Cooling"),
) {
  override async initialize() {
    await super.initialize();
    this.state.localTemperature = this.internal.currentTemperature;
    this.state.systemMode = this.internal.systemMode;
    this.state.occupiedHeatingSetpoint = this.internal.targetTemperature;
    this.state.occupiedCoolingSetpoint = this.internal.targetTemperature;
    this.state.minHeatSetpointLimit = this.internal.minTemperature;
    this.state.minCoolSetpointLimit = this.internal.minTemperature;
    this.state.maxHeatSetpointLimit = this.internal.maxTemperature;
    this.state.maxCoolSetpointLimit = this.internal.maxTemperature;
    this.state.controlSequenceOfOperation =
      Thermostat.ControlSequenceOfOperation.CoolingAndHeating;

    this.events.occupiedHeatingSetpoint$Changed.on(
      this.targetTemperatureChanged.bind(this),
    );
  }

  protected override async update(state: HomeAssistantEntityState) {
    await super.update(state);
    const expectedState = this.internal;
    if (!expectedState) {
      return;
    }
    const actualState = this.endpoint.stateOf(
      HeatingAndCoolingThermostatServer,
    );

    const patch: Behavior.PatchStateOf<
      typeof HeatingAndCoolingThermostatServer
    > = {};
    if (
      expectedState.targetTemperature !== actualState.occupiedHeatingSetpoint
    ) {
      patch.occupiedHeatingSetpoint = expectedState.targetTemperature;
    }
    if (
      expectedState.minTemperature != null &&
      expectedState.minTemperature !== actualState.minHeatSetpointLimit
    ) {
      patch.minHeatSetpointLimit = expectedState.minTemperature;
    }
    if (
      expectedState.maxTemperature != null &&
      expectedState.maxTemperature !== actualState.maxHeatSetpointLimit
    ) {
      patch.maxHeatSetpointLimit = expectedState.maxTemperature;
    }
    if (
      expectedState.targetTemperature !== actualState.occupiedCoolingSetpoint
    ) {
      patch.occupiedCoolingSetpoint = expectedState.targetTemperature;
    }
    if (
      expectedState.minTemperature != null &&
      expectedState.minTemperature !== actualState.minCoolSetpointLimit
    ) {
      patch.minCoolSetpointLimit = expectedState.minTemperature;
    }
    if (
      expectedState.maxTemperature != null &&
      expectedState.maxTemperature !== actualState.maxCoolSetpointLimit
    ) {
      patch.maxCoolSetpointLimit = expectedState.maxTemperature;
    }
    await this.endpoint.setStateOf(HeatingAndCoolingThermostatServer, patch);
  }
}
