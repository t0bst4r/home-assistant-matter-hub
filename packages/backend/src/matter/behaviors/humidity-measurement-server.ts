import { RelativeHumidityMeasurementServer as Base } from "@matter/main/behaviors";
import { HomeAssistantEntityState } from "@home-assistant-matter-hub/common";
import { HomeAssistantBehavior } from "../custom-behaviors/home-assistant-behavior.js";

export interface HumidityMeasurementConfig {
  getValue: (state: HomeAssistantEntityState) => number | null;
}

export class HumidityMeasurementServer extends Base {
  declare state: HumidityMeasurementServer.State;

  override async initialize() {
    await super.initialize();
    const homeAssistant = await this.agent.load(HomeAssistantBehavior);
    this.state.measuredValue = this.getHumidity(
      this.state.config,
      homeAssistant.state.entity,
    );
    homeAssistant.events.entity$Changed.on((s) => this.update(s));
  }

  private async update(state: HomeAssistantEntityState) {
    const current = this.endpoint.stateOf(HumidityMeasurementServer);
    const humidity = this.getHumidity(current.config, state);
    if (current.measuredValue !== humidity) {
      await this.endpoint.setStateOf(HumidityMeasurementServer, {
        measuredValue: humidity,
      });
    }
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
