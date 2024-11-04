import { BooleanStateServer as Base } from "@project-chip/matter.js/behaviors/boolean-state";
import { HomeAssistantEntityState } from "@home-assistant-matter-hub/common";
import { HomeAssistantBehavior } from "../custom-behaviors/home-assistant-behavior.js";

export function BooleanStateServer(inverted: boolean) {
  return class Type extends Base {
    override async initialize() {
      super.initialize();
      const homeAssistant = await this.agent.load(HomeAssistantBehavior);
      this.state.stateValue = getStateValue(
        inverted,
        homeAssistant.state.entity,
      );
      homeAssistant.onUpdate((s) => this.update(s));
    }

    private async update(state: HomeAssistantEntityState) {
      const newState = getStateValue(inverted, state);
      const current = this.endpoint.stateOf(Type);
      if (current.stateValue != newState) {
        await this.endpoint.setStateOf(Type, {
          stateValue: newState,
        });
      }
    }
  };
}

function getStateValue(
  inverted: boolean,
  state: HomeAssistantEntityState,
): boolean {
  const isOn = state.state !== "off";
  return inverted ? !isOn : isOn;
}
