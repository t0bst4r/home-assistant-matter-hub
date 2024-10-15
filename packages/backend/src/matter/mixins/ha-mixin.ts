import { Behavior } from "@project-chip/matter.js/behavior";
import type { MatterDevice } from "../matter-device.js";
import { createChildLogger } from "../../logging/create-child-logger.js";
import { Type } from "@home-assistant-matter-hub/common";

export function haMixin<T extends Type<Behavior>>(name: string, type: T) {
  return class HaMixin extends type {
    override get endpoint(): MatterDevice {
      return super.endpoint as MatterDevice;
    }

    readonly logger = createChildLogger(
      this.endpoint.logger,
      `${this.entity.entity_id} / ${name}`,
    );

    get entity() {
      return this.endpoint.entity;
    }

    callAction = this.endpoint.actions.callAction.bind(this.endpoint.actions);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...args: any[]) {
      super(...args);
    }
  };
}
