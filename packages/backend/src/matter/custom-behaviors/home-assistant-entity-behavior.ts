import { Behavior, EventEmitter } from "@matter/main";
import {
  ClusterId,
  HomeAssistantEntityInformation,
} from "@home-assistant-matter-hub/common";
import type { HassServiceTarget } from "home-assistant-js-websocket/dist/types.js";
import { AsyncObservable } from "../../utils/async-observable.js";
import { HomeAssistantActions } from "../../home-assistant/home-assistant-actions.js";
import AsyncLock from "async-lock";

export class HomeAssistantEntityBehavior extends Behavior {
  static override readonly id = ClusterId.homeAssistantEntity;
  declare state: HomeAssistantEntityBehavior.State;
  declare events: HomeAssistantEntityBehavior.Events;

  get entityId(): string {
    return this.entity.entity_id;
  }

  get entity(): HomeAssistantEntityInformation {
    return this.state.entity;
  }

  get onChange(): HomeAssistantEntityBehavior.Events["entity$Changed"] {
    return this.events.entity$Changed;
  }

  async callAction(
    domain: string,
    action: string,
    data: object | undefined,
    target: HassServiceTarget,
    returnResponse?: boolean,
  ) {
    const lock = this.env.get(AsyncLock);
    const actions = this.env.get(HomeAssistantActions);
    const lockKey = this.state.lockKey;
    setTimeout(async () => {
      await lock.acquire(lockKey, async () =>
        actions.callAction(domain, action, data, target, returnResponse),
      );
    }, 0);
  }
}

export namespace HomeAssistantEntityBehavior {
  export class State {
    lockKey!: string;
    entity!: HomeAssistantEntityInformation;
  }

  export class Events extends EventEmitter {
    entity$Changed = AsyncObservable<HomeAssistantEntityInformation>();
  }
}
