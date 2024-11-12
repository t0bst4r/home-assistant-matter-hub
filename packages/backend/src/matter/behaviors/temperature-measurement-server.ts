import { TemperatureMeasurementServer as Base } from "@matter/main/behaviors";
import { HomeAssistantEntityState } from "@home-assistant-matter-hub/common";
import { HomeAssistantBehavior } from "../custom-behaviors/home-assistant-behavior.js";

export interface TemperatureMeasurementConfig {
  getValue: (state: HomeAssistantEntityState) => number | null;
  getUnitOfMeasurement?: (
    state: HomeAssistantEntityState,
  ) => "K" | "°C" | "°F" | string | null;
}

export class TemperatureMeasurementServer extends Base {
  declare state: TemperatureMeasurementServer.State;

  override async initialize() {
    await super.initialize();
    const homeAssistant = await this.agent.load(HomeAssistantBehavior);
    this.state.measuredValue = this.getTemperature(
      this.state.config,
      homeAssistant.entity,
    );
    homeAssistant.onChange.on(this.callback(this.update));
  }

  private async update(entity: HomeAssistantEntityState) {
    const temperature = this.getTemperature(this.state.config, entity);
    if (this.state.measuredValue !== temperature) {
      this.state.measuredValue = temperature;
    }
  }

  private getTemperature(
    config: TemperatureMeasurementConfig,
    entity: HomeAssistantEntityState,
  ): number | null {
    const value = config.getValue(entity);
    const unitOfMeasurement = config.getUnitOfMeasurement?.(entity);
    if (value == null) {
      return null;
    }
    switch (unitOfMeasurement) {
      case "°F":
        return (value - 32) * (5 / 9) * 100;
      case "K":
        return (value - 273.15) * 100;
      case "°C":
      case "":
      case null:
      case undefined:
        return value * 100;
      default:
        return null;
    }
  }
}

export namespace TemperatureMeasurementServer {
  export class State extends Base.State {
    config!: TemperatureMeasurementConfig;
  }
}
