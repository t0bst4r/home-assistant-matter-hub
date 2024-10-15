import { OnOffServer as Base } from "@project-chip/matter.js/behaviors/on-off";
import { HomeAssistantEntityState } from "@home-assistant-matter-hub/common";
import { haMixin } from "../mixins/ha-mixin.js";
import { Behavior } from "@project-chip/matter.js/behavior";

export class OnOffServer extends haMixin("OnOff", Base) {
  override initialize() {
    super.initialize();
    this.endpoint.entityState.subscribe(this.update.bind(this));
  }

  protected async update(state: HomeAssistantEntityState) {
    const current = this.endpoint.stateOf(OnOffServer);
    const isOn = state.state !== "off";
    if (isOn !== current.onOff) {
      await this.endpoint.setStateOf(OnOffServer, { onOff: isOn });
    }
  }

  override async on() {
    await super.on();
    await this.callAction("homeassistant", "turn_on", undefined, {
      entity_id: this.entity.entity_id,
    });
  }

  override async off() {
    await super.off();
    await this.callAction("homeassistant", "turn_off", undefined, {
      entity_id: this.entity.entity_id,
    });
  }
}

export namespace OnOffServer {
  export function createState(
    state: HomeAssistantEntityState,
  ): Behavior.Options<typeof OnOffServer> {
    return {
      onOff: state.state !== "off",
    };
  }
}
