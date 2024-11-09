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
    const homeAssistant = await this.agent.load(HomeAssistantBehavior);
    this.state.measuredValue = this.getTemperature(
      this.state.config,
      homeAssistant.entity,
    );
    homeAssistant.onUpdate((s) => this.update(s));
    await super.initialize();
  }

  private async update(entity: HomeAssistantEntityState) {
    const current = this.endpoint.stateOf(TemperatureMeasurementServer);
    const temperature = this.getTemperature(current.config, entity);
    if (current.measuredValue !== temperature) {
      await this.endpoint.setStateOf(TemperatureMeasurementServer, {
        measuredValue: temperature,
      });
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
    const temperature = value * 100;
    switch (unitOfMeasurement) {
      case "°C":
        return temperature;
      case "°F":
        return (temperature - 32) * (5 / 9);
      case "K":
        return temperature - 273.15;
      case "":
      case null:
      case undefined:
        return temperature;
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
