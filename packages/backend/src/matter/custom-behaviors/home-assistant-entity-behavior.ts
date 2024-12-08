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

  get isAvailable(): boolean {
    return this.entity.state.state !== "unavailable";
  }

  async callAction(action: string, data?: object | undefined) {
    const lock = this.env.get(AsyncLock);
    const actions = this.env.get(HomeAssistantActions);
    const target: HassServiceTarget = {
      entity_id: this.entityId,
    };
    const lockKey = this.state.lockKey;
    const [domain, service] = action.split(".");
    setTimeout(async () => {
      await lock.acquire(lockKey, async () =>
        actions.callAction(domain, service, data, target, false),
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
