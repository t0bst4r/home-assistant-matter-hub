import { ThermostatServer as Base } from "@project-chip/matter.js/behaviors/thermostat";
import { ThermostatBaseServer } from "./thermostat-base-server.js";
import { HomeAssistantEntityState } from "@home-assistant-matter-hub/common";
import { Behavior } from "@project-chip/matter.js/behavior";
import { Thermostat } from "@project-chip/matter.js/cluster";

export class CoolingThermostatServer extends ThermostatBaseServer(
  Base.with("Cooling"),
) {
  override async initialize() {
    await super.initialize();
    this.state.localTemperature = this.internal.currentTemperature;
    this.state.systemMode = this.internal.systemMode;
    this.state.occupiedCoolingSetpoint = this.internal.targetTemperature;
    this.state.minCoolSetpointLimit = this.internal.minTemperature;
    this.state.maxCoolSetpointLimit = this.internal.maxTemperature;
    this.state.controlSequenceOfOperation =
      Thermostat.ControlSequenceOfOperation.CoolingOnly;
    this.endpoint
      .eventsOf(CoolingThermostatServer)
      .occupiedCoolingSetpoint$Changed.on(
        this.targetTemperatureChanged.bind(this),
      );
  }

  protected override async update(state: HomeAssistantEntityState) {
    await super.update(state);
    const expectedState = this.internal;
    if (!expectedState) {
      return;
    }
    const actualState = this.endpoint.stateOf(CoolingThermostatServer);

    const patch: Behavior.PatchStateOf<typeof CoolingThermostatServer> = {};
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

    await this.endpoint.setStateOf(CoolingThermostatServer, patch);
  }
}
