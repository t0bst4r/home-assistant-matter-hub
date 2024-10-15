import { haMixin } from "../mixins/ha-mixin.js";
import { BooleanStateServer as Base } from "@project-chip/matter.js/behaviors/boolean-state";
import { HomeAssistantEntityState } from "@home-assistant-matter-hub/common";
import { Behavior } from "@project-chip/matter.js/behavior";

export function BooleanStateServer(inverted: boolean) {
  return class Type extends haMixin("BooleanState", Base) {
    override initialize(options?: {}) {
      this.endpoint.entityState.subscribe(this.update.bind(this));
      return super.initialize(options);
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

export namespace BooleanStateServer {
  export function createState(
    inverted: boolean,
    state: HomeAssistantEntityState,
  ): Behavior.Options<typeof Base> {
    return {
      stateValue: getStateValue(inverted, state),
    };
  }
}
