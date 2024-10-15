import { ThermostatBaseServer } from "./thermostat-base-server.js";
import { ThermostatServer as Base } from "@project-chip/matter.js/behavior/definitions/thermostat";
import {
  ClimateDeviceAttributes,
  HomeAssistantEntityState,
} from "@home-assistant-matter-hub/common";
import { Behavior } from "@project-chip/matter.js/behavior";

export class DefaultThermostatServer extends ThermostatBaseServer(Base) {}

export namespace DefaultThermostatServer {
  export function createState(
    entity: HomeAssistantEntityState<ClimateDeviceAttributes>,
  ): Behavior.Options<typeof DefaultThermostatServer> {
    const state = ThermostatBaseServer.createState(entity);
    return {
      localTemperature: state.currentTemperature,
      systemMode: state.systemMode,
    };
  }
}
