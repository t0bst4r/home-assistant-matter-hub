import { ThermostatServer as Base } from "@project-chip/matter.js/behavior/definitions/thermostat";
import { ThermostatBaseServer } from "./thermostat-base-server.js";
import {
  ClimateDeviceAttributes,
  HomeAssistantEntityState,
} from "@home-assistant-matter-hub/common";
import { Behavior } from "@project-chip/matter.js/behavior";

export class CoolingThermostatServer extends ThermostatBaseServer(
  Base.with("Cooling"),
) {
  override initialize(options?: {}) {
    this.endpoint
      .eventsOf(CoolingThermostatServer)
      .occupiedCoolingSetpoint$Changed.on(
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

export namespace CoolingThermostatServer {
  export function createState(
    entity: HomeAssistantEntityState<ClimateDeviceAttributes>,
  ): Behavior.Options<typeof CoolingThermostatServer> {
    const state = ThermostatBaseServer.createState(entity);
    return {
      localTemperature: state.currentTemperature,
      systemMode: state.systemMode,
      occupiedCoolingSetpoint: state.targetTemperature,
      minCoolSetpointLimit: state.minTemperature,
      maxCoolSetpointLimit: state.maxTemperature,
    };
  }
}
