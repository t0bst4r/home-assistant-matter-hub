import { ThermostatServer as Base } from "@project-chip/matter.js/behavior/definitions/thermostat";
import { ThermostatBaseServer } from "./thermostat-base-server.js";
import {
  ClimateDeviceAttributes,
  HomeAssistantEntityState,
} from "@home-assistant-matter-hub/common";
import { Behavior } from "@project-chip/matter.js/behavior";
import { Thermostat } from "@project-chip/matter.js/cluster";

export class HeatingThermostatServer extends ThermostatBaseServer(
  Base.with("Heating"),
) {
  override initialize(options?: {}) {
    this.endpoint
      .eventsOf(HeatingThermostatServer)
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

export namespace HeatingThermostatServer {
  export function createState(
    entity: HomeAssistantEntityState<ClimateDeviceAttributes>,
  ): Behavior.Options<typeof HeatingThermostatServer> {
    const state = ThermostatBaseServer.createState(entity);
    return {
      localTemperature: state.currentTemperature,
      systemMode: state.systemMode,
      occupiedHeatingSetpoint: state.targetTemperature,
      minHeatSetpointLimit: state.minTemperature,
      maxHeatSetpointLimit: state.maxTemperature,
      controlSequenceOfOperation:
        Thermostat.ControlSequenceOfOperation.HeatingOnly,
    };
  }
}
