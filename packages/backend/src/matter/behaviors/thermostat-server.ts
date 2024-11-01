import { HeatingAndCoolingThermostatServer } from "./thermostat/heating-and-cooling-thermostat-server.js";
import { HeatingThermostatServer } from "./thermostat/heating-thermostat-server.js";
import { CoolingThermostatServer } from "./thermostat/cooling-thermostat-server.js";
import { DefaultThermostatServer } from "./thermostat/default-thermostat-server.js";

export function ThermostatServer(
  supportsCooling: boolean,
  supportsHeating: boolean,
  supportsAuto: boolean,
) {
  if (supportsAuto || (supportsCooling && supportsHeating)) {
    return HeatingAndCoolingThermostatServer(supportsAuto);
  } else if (supportsHeating) {
    return HeatingThermostatServer;
  } else if (supportsCooling) {
    return CoolingThermostatServer;
  } else {
    return DefaultThermostatServer;
  }
}
