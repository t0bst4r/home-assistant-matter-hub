import { Behavior, EventEmitter } from "@matter/main";
import {
  ClusterId,
  HomeAssistantEntityInformation,
} from "@home-assistant-matter-hub/common";
import type { HassServiceTarget } from "home-assistant-js-websocket/dist/types.js";
import { AsyncObservable } from "../../utils/async-observable.js";
import { HomeAssistantActions } from "../../home-assistant/home-assistant-actions.js";

export class Mutex {
  private mutex = Promise.resolve();

  private async lock(): Promise<() => void> {
    let begin: (unlock: () => void) => void = (unlock) => {};

    this.mutex = this.mutex.then(() => {
      return new Promise(begin);
    });

    return new Promise<() => void>((res) => {
      begin = res;
    });
  }

  async guard<T>(fn: () => Promise<T>): Promise<T> {
    const unlock = await this.lock();
    try {
      return await fn();
    } finally {
      unlock();
    }
  }
}

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

  async callAction<T = void>(
    domain: string,
    action: string,
    data: object | undefined,
    target: HassServiceTarget,
    returnResponse?: boolean,
  ): Promise<T> {
    return this.state.mutex.guard(() => {
      const actions = this.env.get(HomeAssistantActions);
      return actions.callAction(domain, action, data, target, returnResponse);
    })
  }
}

export namespace HomeAssistantEntityBehavior {
  export class State {
    mutex!: Mutex
    entity!: HomeAssistantEntityInformation;
  }

  export class Events extends EventEmitter {
    entity$Changed = AsyncObservable<HomeAssistantEntityInformation>();
  }
}
