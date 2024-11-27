import { RelativeHumidityMeasurementServer as Base } from "@matter/main/behaviors";
import {
  HomeAssistantEntityInformation,
  HomeAssistantEntityState,
} from "@home-assistant-matter-hub/common";
import { HomeAssistantEntityBehavior } from "../custom-behaviors/home-assistant-entity-behavior.js";
import { applyPatchState } from "../../utils/apply-patch-state.js";

export interface HumidityMeasurementConfig {
  getValue: (state: HomeAssistantEntityState) => number | null;
}

export class HumidityMeasurementServer extends Base {
  declare state: HumidityMeasurementServer.State;

  override async initialize() {
    await super.initialize();
    const homeAssistant = await this.agent.load(HomeAssistantEntityBehavior);
    this.update(homeAssistant.entity);
    this.reactTo(homeAssistant.onChange, this.update);
  }

  private update(entity: HomeAssistantEntityInformation) {
    const humidity = this.getHumidity(this.state.config, entity.state);
    applyPatchState(this.state, { measuredValue: humidity });
  }

  private getHumidity(
    config: HumidityMeasurementConfig,
    entity: HomeAssistantEntityState,
  ): number | null {
    const humidity = config.getValue(entity);
    if (humidity == null) {
      return null;
    }
    return humidity * 100;
  }
}

export namespace HumidityMeasurementServer {
  export class State extends Base.State {
    config!: HumidityMeasurementConfig;
  }
}
