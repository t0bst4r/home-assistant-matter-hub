import { BooleanStateServer as Base } from "@matter/main/behaviors/boolean-state";
import { HomeAssistantEntityState } from "@home-assistant-matter-hub/common";
import { HomeAssistantBehavior } from "../custom-behaviors/home-assistant-behavior.js";
import { applyPatchState } from "../../utils/apply-patch-state.js";

export interface BooleanStateConfig {
  inverted: boolean;
}

export class BooleanStateServer extends Base {
  declare state: BooleanStateServer.State;

  override async initialize() {
    super.initialize();
    const homeAssistant = await this.agent.load(HomeAssistantBehavior);
    this.update(homeAssistant.entity);
    this.reactTo(homeAssistant.onChange, this.update);
  }

  private update(state: HomeAssistantEntityState) {
    const newState = this.getStateValue(state);
    applyPatchState(this.state, { stateValue: newState });
  }

  private getStateValue(state: HomeAssistantEntityState): boolean {
    const inverted = this.state.config.inverted;
    const isOn = state.state !== "off";
    return inverted ? !isOn : isOn;
  }
}

export namespace BooleanStateServer {
  export class State extends Base.State {
    config!: BooleanStateConfig;
  }
}
