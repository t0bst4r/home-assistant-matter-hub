import { OnOffServer as Base } from "@matter/main/behaviors";
import {
  HomeAssistantEntityInformation,
  HomeAssistantEntityState,
} from "@home-assistant-matter-hub/common";
import { HomeAssistantEntityBehavior } from "../custom-behaviors/home-assistant-entity-behavior.js";
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
    const homeAssistant = await this.agent.load(HomeAssistantEntityBehavior);
    this.update(homeAssistant.entity);
    this.reactTo(homeAssistant.onChange, this.update);
  }

  private update({ state }: HomeAssistantEntityInformation) {
    applyPatchState(this.state, {
      onOff: this.isOn(state),
    });
  }

  override async on() {
    const homeAssistant = this.agent.get(HomeAssistantEntityBehavior);
    if (this.isOn(homeAssistant.entity.state)) {
      return;
    }
    const action = this.state.config?.turnOn?.action ?? "homeassistant.turn_on";
    await homeAssistant.callAction(action);
  }

  override async off() {
    const homeAssistant = this.agent.get(HomeAssistantEntityBehavior);
    if (!this.isOn(homeAssistant.entity.state)) {
      return;
    }
    const action =
      this.state.config?.turnOff?.action ?? "homeassistant.turn_off";
    await homeAssistant.callAction(action);
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
