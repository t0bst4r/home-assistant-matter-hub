import { RelativeHumidityMeasurementServer as Base } from "@project-chip/matter.js/behaviors/relative-humidity-measurement";
import {
  HomeAssistantEntityState,
  SensorDeviceAttributes,
} from "@home-assistant-matter-hub/common";
import { HomeAssistantBehavior } from "../custom-behaviors/home-assistant-behavior.js";

export class HumidityMeasurementServer extends Base {
  override async initialize() {
    await super.initialize();
    const homeAssistant = await this.agent.load(HomeAssistantBehavior);
    this.state.measuredValue = getHumidity(homeAssistant.state.entity);
    homeAssistant.onUpdate((s) => this.update(s));
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

function getHumidity({
  state,
}: HomeAssistantEntityState<SensorDeviceAttributes>): number | null {
  if (state == null || isNaN(+state)) {
    return null;
  }
  return +state * 100;
}
