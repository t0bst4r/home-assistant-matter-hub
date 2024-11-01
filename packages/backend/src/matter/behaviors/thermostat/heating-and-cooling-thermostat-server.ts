import { ThermostatServer as Base } from "@project-chip/matter.js/behavior/definitions/thermostat";
import { ThermostatBaseServer } from "./thermostat-base-server.js";
import {
  ClimateDeviceAttributes,
  HomeAssistantEntityState,
} from "@home-assistant-matter-hub/common";
import { Behavior } from "@project-chip/matter.js/behavior";
import { Thermostat } from "@project-chip/matter.js/cluster";

export class HeatingAndCoolingThermostatServer extends ThermostatBaseServer(
  Base.with("Heating", "Cooling"),
) {
  override initialize(options?: {}) {
    this.endpoint
      .eventsOf(HeatingAndCoolingThermostatServer)
      .occupiedHeatingSetpoint$Changed.on(
        this.targetTemperatureChanged.bind(this),
      );
    return super.initialize(options);
  }

  protected override async update(state: HomeAssistantEntityState) {
    await super.update(state);
    const expectedState = this.currentState;
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

export namespace HeatingAndCoolingThermostatServer {
  export function createState(
    entity: HomeAssistantEntityState<ClimateDeviceAttributes>,
  ): Behavior.Options<typeof HeatingAndCoolingThermostatServer> {
    const state = ThermostatBaseServer.createState(entity);
    return {
      localTemperature: state.currentTemperature,
      systemMode: state.systemMode,
      occupiedHeatingSetpoint: state.targetTemperature,
      occupiedCoolingSetpoint: state.targetTemperature,
      minHeatSetpointLimit: state.minTemperature,
      minCoolSetpointLimit: state.minTemperature,
      maxHeatSetpointLimit: state.maxTemperature,
      maxCoolSetpointLimit: state.maxTemperature,
      controlSequenceOfOperation:
        Thermostat.ControlSequenceOfOperation.CoolingAndHeating,
    };
  }
}
