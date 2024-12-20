import { OnOffServer as Base } from "@matter/main/behaviors";
import { HomeAssistantEntityBehavior } from "../custom-behaviors/home-assistant-entity-behavior.js";

export interface AutoOffConfig {
  turnOn?: {
    action?: string;
    timeout?: number;
  };
}

export class AutoOffServer extends Base {
  declare state: AutoOffServer.State;

  override async initialize() {
    super.initialize();
    await this.agent.load(HomeAssistantEntityBehavior);
  }

  override async on() {
    const homeAssistant = this.agent.get(HomeAssistantEntityBehavior);
    const action = this.state.config?.turnOn?.action ?? "homeassistant.turn_on";
    await homeAssistant.callAction(action);

    setTimeout(
      this.callback(this.off),
      this.state.config?.turnOn?.timeout ?? 1000,
    );
  }

  override async off() {
    this.state.onOff = false;
  }
}

export namespace AutoOffServer {
  export class State extends Base.State {
    config?: AutoOffConfig;
  }
}
