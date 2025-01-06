import { OnOffServer as Base } from "@matter/main/behaviors";
import { HomeAssistantEntityBehavior } from "../custom-behaviors/home-assistant-entity-behavior.js";
import { HomeAssistantEntityInformation } from "@home-assistant-matter-hub/common";

export interface AutoOffConfig {
  turnOn?: {
    action?: string;
    timeout?: number;
  };
}

export class AutoOffServer extends Base {
  declare state: AutoOffServer.State;
  declare internal: AutoOffServer.Internal;

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
      !isNaN(lastPressed) &&
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

export namespace AutoOffServer {
  export class State extends Base.State {
    config?: AutoOffConfig;
  }

  export class Internal extends Base.Internal {
    turnOffTimeout!: number;
  }
}
