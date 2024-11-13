import { OnOffServer as Base } from "@matter/main/behaviors";
import { HomeAssistantEntityState } from "@home-assistant-matter-hub/common";
import { HomeAssistantBehavior } from "../custom-behaviors/home-assistant-behavior.js";
import { applyPatchState } from "../../utils/apply-patch-state.js";

export class OnOffServer extends Base {
  override async initialize() {
    super.initialize();
    const homeAssistant = await this.agent.load(HomeAssistantBehavior);
    this.update(homeAssistant.entity);
    this.reactTo(homeAssistant.onChange, this.update);
  }

  private update(state: HomeAssistantEntityState) {
    applyPatchState(this.state, {
      onOff: this.isOn(state),
    });
  }

  override async on() {
    const homeAssistant = this.agent.get(HomeAssistantBehavior);
    if (this.isOn(homeAssistant.entity)) {
      return;
    }
    await homeAssistant.callAction("homeassistant", "turn_on", undefined, {
      entity_id: homeAssistant.entityId,
    });
  }

  override async off() {
    const homeAssistant = this.agent.get(HomeAssistantBehavior);
    if (!this.isOn(homeAssistant.entity)) {
      return;
    }
    await homeAssistant.callAction("homeassistant", "turn_off", undefined, {
      entity_id: homeAssistant.entityId,
    });
  }

  private isOn(state: HomeAssistantEntityState) {
    return state.state !== "off";
  }
}
