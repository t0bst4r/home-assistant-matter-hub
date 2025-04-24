import type {
  HomeAssistantEntityInformation,
  HomeAssistantEntityState,
} from "@home-assistant-matter-hub/common";
import { BooleanStateServer as Base } from "@matter/main/behaviors/boolean-state";
import { applyPatchState } from "../../utils/apply-patch-state.js";
import { HomeAssistantEntityBehavior } from "../custom-behaviors/home-assistant-entity-behavior.js";

export interface BooleanStateConfig {
  inverted: boolean;
}

class BooleanStateServerBase extends Base {
  declare state: BooleanStateServerBase.State;

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

  private getStateValue(entity: HomeAssistantEntityState): boolean {
    const inverted = this.state.config?.inverted;
    const isOn =
      this.agent.get(HomeAssistantEntityBehavior).isAvailable &&
      entity.state !== "off";
    return inverted ? !isOn : isOn;
  }
}

namespace BooleanStateServerBase {
  export class State extends Base.State {
    config?: BooleanStateConfig;
  }
}

export function BooleanStateServer(config?: BooleanStateConfig) {
  return BooleanStateServerBase.set({ config });
}
