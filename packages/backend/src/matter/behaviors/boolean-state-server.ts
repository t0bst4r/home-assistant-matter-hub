import { BooleanStateServer as Base } from "@matter/main/behaviors/boolean-state";
import { HomeAssistantEntityState } from "@home-assistant-matter-hub/common";
import { HomeAssistantBehavior } from "../custom-behaviors/home-assistant-behavior.js";

export interface BooleanStateConfig {
  inverted: boolean;
}

export class BooleanStateServer extends Base {
  declare state: BooleanStateServer.State;

  override async initialize() {
    super.initialize();
    const homeAssistant = await this.agent.load(HomeAssistantBehavior);
    this.state.stateValue = this.getStateValue(
      this.state.config,
      homeAssistant.state.entity,
    );
    homeAssistant.onUpdate((s) => this.update(s));
  }

  private async update(state: HomeAssistantEntityState) {
    const current = this.endpoint.stateOf(BooleanStateServer);
    const newState = this.getStateValue(current.config, state);
    if (current.stateValue != newState) {
      await this.endpoint.setStateOf(BooleanStateServer, {
        stateValue: newState,
      });
    }
  }

  private getStateValue(
    config: BooleanStateConfig,
    state: HomeAssistantEntityState,
  ): boolean {
    const inverted = config.inverted;
    const isOn = state.state !== "off";
    return inverted ? !isOn : isOn;
  }
}

export namespace BooleanStateServer {
  export class State extends Base.State {
    config!: BooleanStateConfig;
  }
}
