import { IdentifyServer as Base } from "@project-chip/matter.js/behavior/definitions/identify";
import { haMixin } from "../mixins/ha-mixin.js";

export class IdentifyServer extends haMixin("Identify", Base) {
  override triggerEffect() {
    this.logger.info(`Identifying ${this.entity.entity_id}`);
  }
}
