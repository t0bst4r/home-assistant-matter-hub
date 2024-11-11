import { Behavior, EventEmitter } from "@matter/main";
import {
  BridgeBasicInformation,
  HomeAssistantEntityRegistry,
  HomeAssistantEntityState,
} from "@home-assistant-matter-hub/common";
import type { HassServiceTarget } from "home-assistant-js-websocket/dist/types.js";
import { AsyncObservable } from "../../utils/async-observable.js";
import { HomeAssistantActions } from "../../home-assistant/home-assistant-actions.js";

export class HomeAssistantBehavior extends Behavior {
  static override readonly id = "homeAssistant";
  declare state: HomeAssistantBehavior.State;
  declare events: HomeAssistantBehavior.Events;

  get entityId(): string {
    return this.entity.entity_id;
  }

  get entity(): HomeAssistantEntityState {
    return this.state.entity;
  }

  get onChange(): HomeAssistantBehavior.Events["entity$Changed"] {
    return this.events.entity$Changed;
  }

  async callAction<T = void>(
    domain: string,
    action: string,
    data: object | undefined,
    target: HassServiceTarget,
    returnResponse?: boolean,
  ): Promise<T> {
    return this.state.actions.callAction(
      domain,
      action,
      data,
      target,
      returnResponse,
    );
  }
}

export namespace HomeAssistantBehavior {
  export class State {
    actions!: HomeAssistantActions;
    basicInformation!: BridgeBasicInformation;
    registry!: HomeAssistantEntityRegistry;
    entity!: HomeAssistantEntityState;
  }

  export class Events extends EventEmitter {
    entity$Changed = AsyncObservable<HomeAssistantEntityState>();
  }
}
