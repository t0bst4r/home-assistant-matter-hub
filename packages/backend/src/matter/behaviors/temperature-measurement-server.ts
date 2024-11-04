import { TemperatureMeasurementServer as Base } from "@project-chip/matter.js/behaviors/temperature-measurement";
import {
  HomeAssistantEntityState,
  SensorDeviceAttributes,
} from "@home-assistant-matter-hub/common";
import { HomeAssistantBehavior } from "../custom-behaviors/home-assistant-behavior.js";

export class TemperatureMeasurementServer extends Base {
  override async initialize() {
    const homeAssistant = await this.agent.load(HomeAssistantBehavior);
    this.state.measuredValue = getTemperature(homeAssistant.state.entity);
    homeAssistant.onUpdate((s) => this.update(s));
    await super.initialize();
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
