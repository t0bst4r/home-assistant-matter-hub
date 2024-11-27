import { BooleanStateServer as Base } from "@matter/main/behaviors/boolean-state";
import {
  HomeAssistantEntityInformation,
  HomeAssistantEntityState,
} from "@home-assistant-matter-hub/common";
import { HomeAssistantEntityBehavior } from "../custom-behaviors/home-assistant-entity-behavior.js";
import { applyPatchState } from "../../utils/apply-patch-state.js";

export interface BooleanStateConfig {
  inverted: boolean;
}

export class BooleanStateServer extends Base {
  declare state: BooleanStateServer.State;

  override async initialize() {
    super.initialize();
    const homeAssistant = await this.agent.load(HomeAssistantEntityBehavior);
    this.update(homeAssistant.entity);
    this.reactTo(homeAssistant.onChange, this.update);
  }

  private update(entity: HomeAssistantEntityInformation) {
    const newState = this.getStateValue(entity.state);
    applyPatchState(this.state, { stateValue: newState });
  }

  private getStateValue(state: HomeAssistantEntityState): boolean {
    const inverted = this.state.config?.inverted;
    const isOn = state.state !== "off";
    return inverted ? !isOn : isOn;
  }
}

export namespace BooleanStateServer {
  export class State extends Base.State {
    config?: BooleanStateConfig;
  }
}
