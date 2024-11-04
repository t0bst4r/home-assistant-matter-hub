import { ThermostatServer as Base } from "@project-chip/matter.js/behaviors/thermostat";
import { ThermostatBaseServer } from "./thermostat-base-server.js";
import { HomeAssistantEntityState } from "@home-assistant-matter-hub/common";
import { Behavior } from "@project-chip/matter.js/behavior";
import { Thermostat } from "@project-chip/matter.js/cluster";

export class HeatingThermostatServer extends ThermostatBaseServer(
  Base.with("Heating"),
) {
  override async initialize() {
    await super.initialize();
    this.state.localTemperature = this.internal.currentTemperature;
    this.state.systemMode = this.internal.systemMode;
    this.state.occupiedHeatingSetpoint = this.internal.targetTemperature;
    this.state.minHeatSetpointLimit = this.internal.minTemperature;
    this.state.maxHeatSetpointLimit = this.internal.maxTemperature;
    this.state.controlSequenceOfOperation =
      Thermostat.ControlSequenceOfOperation.HeatingOnly;

    this.endpoint
      .eventsOf(HeatingThermostatServer)
      .occupiedHeatingSetpoint$Changed.on(
        this.targetTemperatureChanged.bind(this),
      );
  }

  protected override async update(state: HomeAssistantEntityState) {
    await super.update(state);
    const expectedState = this.internal;
    if (!expectedState) {
      return;
    }
    const actualState = this.endpoint.stateOf(HeatingThermostatServer);

    const patch: Behavior.PatchStateOf<typeof HeatingThermostatServer> = {};
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

    await this.endpoint.setStateOf(HeatingThermostatServer, patch);
  }
}
