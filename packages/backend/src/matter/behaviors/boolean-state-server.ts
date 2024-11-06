import { BooleanStateServer as Base } from "@project-chip/matter.js/behaviors/boolean-state";
import { HomeAssistantEntityState } from "@home-assistant-matter-hub/common";
import { HomeAssistantBehavior } from "../custom-behaviors/home-assistant-behavior.js";

export class BooleanStateServer extends Base {
  declare state: BooleanStateServer.State;

  override async initialize() {
    super.initialize();
    const homeAssistant = await this.agent.load(HomeAssistantBehavior);
    this.state.stateValue = this.getStateValue(homeAssistant.state.entity);
    homeAssistant.onUpdate((s) => this.update(s));
  }

  private async update(state: HomeAssistantEntityState) {
    const newState = this.getStateValue(state);
    const current = this.endpoint.stateOf(BooleanStateServer);
    if (current.stateValue != newState) {
      await this.endpoint.setStateOf(BooleanStateServer, {
        stateValue: newState,
      });
    }
  }

  private getStateValue(state: HomeAssistantEntityState): boolean {
    const inverted = this.state.inverted ?? false;
    const isOn = state.state !== "off";
    return inverted ? !isOn : isOn;
  }
}

export namespace BooleanStateServer {
  export class State extends Base.State {
    inverted?: boolean;
  }
}
