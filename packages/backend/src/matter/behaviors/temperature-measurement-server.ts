import { TemperatureMeasurementServer as Base } from "@project-chip/matter.js/behaviors/temperature-measurement";
import {
  HomeAssistantEntityState,
  SensorDeviceAttributes,
} from "@home-assistant-matter-hub/common";
import { Behavior } from "@project-chip/matter.js/behavior";
import { haMixin } from "../mixins/ha-mixin.js";

export class TemperatureMeasurementServer extends haMixin(
  "TemperatureMeasurement",
  Base,
) {
  override initialize(options?: {}) {
    this.endpoint.entityState.subscribe(this.update.bind(this));
    return super.initialize(options);
  }

  private async update(state: HomeAssistantEntityState) {
    const temperature = getTemperature(state);
    const current = this.endpoint.stateOf(TemperatureMeasurementServer);
    if (current.measuredValue !== temperature) {
      await this.endpoint.setStateOf(TemperatureMeasurementServer, {
        measuredValue: temperature,
      });
    }
  }
}

export namespace TemperatureMeasurementServer {
  export function createState(
    state: HomeAssistantEntityState<SensorDeviceAttributes>,
  ): Behavior.Options<typeof TemperatureMeasurementServer> {
    return {
      measuredValue: getTemperature(state),
    };
  }
}

function getTemperature({
  state,
  attributes,
}: HomeAssistantEntityState<SensorDeviceAttributes>): number | null {
  if (state == null || isNaN(+state)) {
    return null;
  }
  const temperature = +state * 100;
  switch (attributes.unit_of_measurement) {
    case "°C":
      return temperature;
    case "°F":
      return (temperature - 32) * (5 / 9);
    case "K":
      return temperature - 273.15;
    default:
      return null;
  }
}
