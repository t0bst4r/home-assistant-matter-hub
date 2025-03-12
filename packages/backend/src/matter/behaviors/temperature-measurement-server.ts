import { TemperatureMeasurementServer as Base } from "@matter/main/behaviors";
import {
  HomeAssistantEntityInformation,
  HomeAssistantEntityState,
} from "@home-assistant-matter-hub/common";
import { HomeAssistantEntityBehavior } from "../custom-behaviors/home-assistant-entity-behavior.js";
import { applyPatchState } from "../../utils/apply-patch-state.js";
import { homeAssistantToMatterTemperature } from "./utils/thermostat-server-utils.js";

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
    const homeAssistant = await this.agent.load(HomeAssistantEntityBehavior);
    this.update(homeAssistant.entity);
    this.reactTo(homeAssistant.onChange, this.update);
  }

  private update(entity: HomeAssistantEntityInformation) {
    applyPatchState(this.state, {
      measuredValue: this.getTemperature(entity.state),
    });
  }

  private getTemperature(entity: HomeAssistantEntityState): number | null {
    const value = this.state.config.getValue(entity);
    const unitOfMeasurement =
      this.state.config.getUnitOfMeasurement?.(entity) ?? "C";
    return homeAssistantToMatterTemperature(value, unitOfMeasurement) ?? null;
  }
}

export namespace TemperatureMeasurementServer {
  export class State extends Base.State {
    config!: TemperatureMeasurementConfig;
  }
}
