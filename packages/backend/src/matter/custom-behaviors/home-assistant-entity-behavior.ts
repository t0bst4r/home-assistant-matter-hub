import {
  ClusterId,
  type HomeAssistantEntityInformation,
} from "@home-assistant-matter-hub/common";
import type { Logger } from "@matter/general";
import { Behavior, EventEmitter } from "@matter/main";
import AsyncLock from "async-lock";
import type { HassServiceTarget } from "home-assistant-js-websocket/dist/types.js";
import { LoggerService } from "../../environment/logger.js";
import {
  type HomeAssistantAction,
  HomeAssistantActions,
} from "../../home-assistant/home-assistant-actions.js";
import { HomeAssistantConfig } from "../../home-assistant/home-assistant-config.js";
import { AsyncObservable } from "../../utils/async-observable.js";

export class HomeAssistantEntityBehavior extends Behavior {
  static override readonly id = ClusterId.homeAssistantEntity;
  declare internal: HomeAssistantEntityBehavior.Internal;
  declare state: HomeAssistantEntityBehavior.State;
  declare events: HomeAssistantEntityBehavior.Events;

  override async initialize() {
    await this.env.load(HomeAssistantConfig);
    this.internal.logger = this.env
      .get(LoggerService)
      .get(`HomeAssistant / ${this.entityId}`);
  }

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

  async callAction(action: HomeAssistantAction) {
    const actions = this.env.get(HomeAssistantActions);
    const lock = this.env.get(AsyncLock);
    const lockKey = this.state.lockKey;
    const log = this.internal.logger;

    const target: HassServiceTarget = {
      entity_id: this.entityId,
    };
    setTimeout(async () => {
      await lock.acquire(lockKey, async () =>
        actions.call(action, target, false).catch((error) => log.error(error)),
      );
    }, 0);
  }

  async callQueryAction<T>(action: HomeAssistantAction): Promise<T> {
    const actions = this.env.get(HomeAssistantActions);
    const lock = this.env.get(AsyncLock);
    const lockKey = this.state.lockKey;
    const log = this.internal.logger;

    const target: HassServiceTarget = {
      entity_id: this.entityId,
    };

    return await lock.acquire<T>(lockKey, async () =>
      actions
        .call<T>(action, target, true)
        .catch((error) => console.error(error)),
    );
  }
}

export namespace HomeAssistantEntityBehavior {
  export class Internal {
    logger!: Logger;
  }

  export class State {
    lockKey!: string;
    entity!: HomeAssistantEntityInformation;
  }

  export class Events extends EventEmitter {
    entity$Changed = AsyncObservable<HomeAssistantEntityInformation>();
  }
}
