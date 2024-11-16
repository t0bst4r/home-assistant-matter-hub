import { OnOffServer as Base } from "@matter/main/behaviors";
import { HomeAssistantEntityState } from "@home-assistant-matter-hub/common";
import { HomeAssistantBehavior } from "../custom-behaviors/home-assistant-behavior.js";
import { applyPatchState } from "../../utils/apply-patch-state.js";

export interface OnOffConfig {
  isOn?: (state: HomeAssistantEntityState) => boolean;
  turnOn?: {
    action: string;
  };
  turnOff?: {
    action: string;
  };
}

export class OnOffServer extends Base {
  declare state: OnOffServer.State;

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
    const [domain, action] = (
      this.state.config?.turnOn?.action ?? "homeassistant.turn_on"
    ).split(".");
    await homeAssistant.callAction(domain, action, undefined, {
      entity_id: homeAssistant.entityId,
    });
  }

  override async off() {
    const homeAssistant = this.agent.get(HomeAssistantBehavior);
    if (!this.isOn(homeAssistant.entity)) {
      return;
    }
    const [domain, action] = (
      this.state.config?.turnOff?.action ?? "homeassistant.turn_off"
    ).split(".");
    await homeAssistant.callAction(domain, action, undefined, {
      entity_id: homeAssistant.entityId,
    });
  }

  private isOn(state: HomeAssistantEntityState) {
    const isOn = this.state.config?.isOn ?? ((e) => e.state !== "off");
    return isOn(state);
  }
}

export namespace OnOffServer {
  export class State extends Base.State {
    config?: OnOffConfig;
  }
}
