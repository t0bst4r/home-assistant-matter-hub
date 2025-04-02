import type {
  HomeAssistantEntityInformation,
  HomeAssistantEntityState,
} from "@home-assistant-matter-hub/common";
import type { Agent } from "@matter/main";
import { OnOffServer as Base } from "@matter/main/behaviors";
import { OnOff } from "@matter/main/clusters";
import { ClusterType } from "@matter/main/types";
import { applyPatchState } from "../../utils/apply-patch-state.js";
import { HomeAssistantEntityBehavior } from "../custom-behaviors/home-assistant-entity-behavior.js";

export interface OnOffConfig {
  isOn?: (state: HomeAssistantEntityState, agent: Agent) => boolean;
  turnOn?: {
    action: string;
    data?: object;
  };
  turnOff?: {
    action: string;
    data?: object;
  };
}

const FeaturedBased = Base.with("Lighting");

export class OnOffServerBase extends FeaturedBased {
  declare state: OnOffServerBase.State;

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
    const action = this.state.config?.turnOn?.action ?? "homeassistant.turn_on";
    const data = this.state.config?.turnOn?.data;
    await homeAssistant.callAction(action, data);
  }

  override async off() {
    const homeAssistant = this.agent.get(HomeAssistantEntityBehavior);
    const action =
      this.state.config?.turnOff?.action ?? "homeassistant.turn_off";
    const data = this.state.config?.turnOff?.data;
    await homeAssistant.callAction(action, data);
  }

  private isOn(state: HomeAssistantEntityState) {
    const isOn =
      this.state.config?.isOn ??
      ((e) => e.state !== "off" && e.state !== "unavailable");
    return isOn(state, this.agent);
  }
}

export namespace OnOffServerBase {
  export class State extends FeaturedBased.State {
    config?: OnOffConfig;
  }
}

export class OnOffServer extends OnOffServerBase.for(ClusterType(OnOff.Base)) {}
