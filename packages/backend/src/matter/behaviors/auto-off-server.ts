import type { HomeAssistantEntityInformation } from "@home-assistant-matter-hub/common";
import { OnOffServer as Base } from "@matter/main/behaviors";
import { OnOff } from "@matter/main/clusters";
import { ClusterType } from "@matter/main/types";
import { HomeAssistantEntityBehavior } from "../custom-behaviors/home-assistant-entity-behavior.js";

export interface AutoOffConfig {
  turnOn?: {
    action?: string;
    timeout?: number;
  };
}

const FeaturedBased = Base.with("Lighting");

export class AutoOffServerBase extends FeaturedBased {
  declare state: AutoOffServerBase.State;
  declare internal: AutoOffServerBase.Internal;

  override async initialize() {
    super.initialize();
    const homeAssistant = await this.agent.load(HomeAssistantEntityBehavior);
    this.update(homeAssistant.entity);
    this.reactTo(homeAssistant.onChange, this.update);
  }

  private update(entity: HomeAssistantEntityInformation) {
    this.internal.turnOffTimeout = this.state.config?.turnOn?.timeout ?? 1000;
    const lastPressed = new Date(entity.state.state).getTime();
    this.state.onOff =
      !Number.isNaN(lastPressed) &&
      Date.now() - lastPressed < this.internal.turnOffTimeout;
  }

  override async on() {
    const homeAssistant = this.agent.get(HomeAssistantEntityBehavior);
    const action = this.state.config?.turnOn?.action ?? "homeassistant.turn_on";
    await homeAssistant.callAction(action);
    setTimeout(this.callback(this.off), this.internal.turnOffTimeout);
  }

  override async off() {
    this.state.onOff = false;
  }
}

export namespace AutoOffServerBase {
  export class State extends FeaturedBased.State {
    config?: AutoOffConfig;
  }

  export class Internal extends FeaturedBased.Internal {
    turnOffTimeout!: number;
  }
}

export class AutoOffServer extends AutoOffServerBase.for(
  ClusterType(OnOff.Base),
) {}
