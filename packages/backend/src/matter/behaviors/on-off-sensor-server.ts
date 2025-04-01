import type {
  HomeAssistantEntityInformation,
  HomeAssistantEntityState,
} from "@home-assistant-matter-hub/common";
import { OnOffBehavior as Base } from "@matter/main/behaviors";
import { applyPatchState } from "../../utils/apply-patch-state.js";
import { HomeAssistantEntityBehavior } from "../custom-behaviors/home-assistant-entity-behavior.js";

export interface OnOffConfig {
  isOn?: (state: HomeAssistantEntityState) => boolean;
}

export class OnOffSensorServer extends Base {
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

  private isOn(state: HomeAssistantEntityState) {
    const isOn =
      this.state.config?.isOn ??
      ((e) => e.state !== "off" && e.state !== "unavailable");
    return isOn(state);
  }
}

export namespace OnOffServer {
  export class State extends Base.State {
    config?: OnOffConfig;
  }
}
