import { OnOffServer as Base } from "@matter/main/behaviors";
import { HomeAssistantEntityState } from "@home-assistant-matter-hub/common";
import { HomeAssistantBehavior } from "../custom-behaviors/home-assistant-behavior.js";

export class OnOffServer extends Base {
  override async initialize() {
    super.initialize();
    const homeAssistant = await this.agent.load(HomeAssistantBehavior);
    this.state.onOff = homeAssistant.state.entity.state !== "off";
    homeAssistant.onChange.on(this.callback(this.update));
  }

  private async update(state: HomeAssistantEntityState) {
    const isOn = state.state !== "off";
    if (isOn !== this.state.onOff) {
      this.state.onOff = isOn;
    }
  }

  override async on() {
    await super.on();
    const homeAssistant = this.agent.get(HomeAssistantBehavior);
    await homeAssistant.callAction("homeassistant", "turn_on", undefined, {
      entity_id: homeAssistant.entityId,
    });
  }

  override async off() {
    await super.off();
    const homeAssistant = this.agent.get(HomeAssistantBehavior);
    await homeAssistant.callAction("homeassistant", "turn_off", undefined, {
      entity_id: homeAssistant.entityId,
    });
  }
}
