import { TemperatureMeasurementServer as Base } from "@matter/main/behaviors";
import { HomeAssistantEntityState } from "@home-assistant-matter-hub/common";
import { HomeAssistantBehavior } from "../custom-behaviors/home-assistant-behavior.js";
import { applyPatchState } from "../../utils/apply-patch-state.js";

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
    this.update(homeAssistant.entity);
    this.reactTo(homeAssistant.onChange, this.update);
  }

  private update(entity: HomeAssistantEntityState) {
    applyPatchState(this.state, {
      measuredValue: this.getTemperature(entity),
    });
  }

  private getTemperature(entity: HomeAssistantEntityState): number | null {
    const value = this.state.config.getValue(entity);
    const unitOfMeasurement = this.state.config.getUnitOfMeasurement?.(entity);
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
