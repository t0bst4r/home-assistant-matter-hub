import { OnOffServer as Base } from "@matter/main/behaviors";
import {
  HomeAssistantEntityInformation,
  HomeAssistantEntityState,
} from "@home-assistant-matter-hub/common";
import { HomeAssistantEntityBehavior } from "../custom-behaviors/home-assistant-entity-behavior.js";
import { applyPatchState } from "../../utils/apply-patch-state.js";
import { LevelControlServer } from "./level-control-server.js";

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
    if (this.agent.has(LevelControlServer)) {
      const levelControl = this.agent.get(LevelControlServer);
      const currentLevel = levelControl.state.currentLevel;
      if (currentLevel != undefined) {
        await levelControl.moveToLevelWithOnOff({
          level: currentLevel,
          transitionTime: null,
          optionsMask: {},
          optionsOverride: {},
        });
        return;
      }
    }

    const homeAssistant = this.agent.get(HomeAssistantEntityBehavior);
    if (this.isOn(homeAssistant.entity.state)) {
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
    const homeAssistant = this.agent.get(HomeAssistantEntityBehavior);
    if (!this.isOn(homeAssistant.entity.state)) {
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
