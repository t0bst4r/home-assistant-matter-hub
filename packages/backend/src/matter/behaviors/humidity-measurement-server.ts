import { RelativeHumidityMeasurementServer as Base } from "@project-chip/matter.js/behaviors/relative-humidity-measurement";
import {
  HomeAssistantEntityState,
  SensorDeviceAttributes,
} from "@home-assistant-matter-hub/common";
import { Behavior } from "@project-chip/matter.js/behavior";
import { haMixin } from "../mixins/ha-mixin.js";

export class HumidityMeasurementServer extends haMixin(
  "HumidityMeasurement",
  Base,
) {
  override initialize(options?: {}) {
    this.endpoint.entityState.subscribe(this.update.bind(this));
    return super.initialize(options);
  }

  private async update(state: HomeAssistantEntityState) {
    const humidity = getHumidity(state);
    const current = this.endpoint.stateOf(HumidityMeasurementServer);
    if (current.measuredValue !== humidity) {
      await this.endpoint.setStateOf(HumidityMeasurementServer, {
        measuredValue: humidity,
      });
    }
  }
}

export namespace HumidityMeasurementServer {
  export function createState(
    state: HomeAssistantEntityState<SensorDeviceAttributes>,
  ): Behavior.Options<typeof HumidityMeasurementServer> {
    return {
      measuredValue: getHumidity(state),
    };
  }
}

function getHumidity({
  state,
}: HomeAssistantEntityState<SensorDeviceAttributes>): number | null {
  if (state == null || isNaN(+state)) {
    return null;
  }
  return +state * 100;
}
