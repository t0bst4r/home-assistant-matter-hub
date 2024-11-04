import { Behavior } from "@project-chip/matter.js/behavior";
import {
  BridgeBasicInformation,
  HomeAssistantEntityRegistry,
  HomeAssistantEntityState,
} from "@home-assistant-matter-hub/common";
import type { HassServiceTarget } from "home-assistant-js-websocket/dist/types.js";
import { EventEmitter, MaybePromise } from "@project-chip/matter.js/util";
import { AsyncObservable } from "../../utils/async-observable.js";
import { HomeAssistantActions } from "../../home-assistant/home-assistant-actions.js";

export class HomeAssistantBehavior extends Behavior {
  static override readonly id = "homeAssistant";
  declare state: HomeAssistantBehavior.State;
  declare events: HomeAssistantBehavior.Events;

  get entity(): HomeAssistantEntityState {
    return this.state.entity;
  }

  public onUpdate(
    callback: (entity: HomeAssistantEntityState) => MaybePromise<void>,
  ) {
    this.events.entity$Changed.on(callback);
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
