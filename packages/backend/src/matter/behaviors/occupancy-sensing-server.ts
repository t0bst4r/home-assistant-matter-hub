import { haMixin } from "../mixins/ha-mixin.js";
import { OccupancySensingServer as Base } from "@project-chip/matter.js/behaviors/occupancy-sensing";
import { HomeAssistantEntityState } from "@home-assistant-matter-hub/common";
import { Behavior } from "@project-chip/matter.js/behavior";
import { OccupancySensing } from "@project-chip/matter.js/cluster";

export class OccupancySensingServer extends haMixin("OccupancySensing", Base) {
  override initialize(options?: {}) {
    this.endpoint.entityState.subscribe(this.update.bind(this));
    return super.initialize(options);
  }

  private async update(state: HomeAssistantEntityState) {
    const occupied = isOccupied(state);
    const current = this.endpoint.stateOf(OccupancySensingServer);
    if (current.occupancy.occupied !== occupied) {
      await this.endpoint.setStateOf(OccupancySensingServer, {
        occupancy: { occupied },
      });
    }
  }
}

function isOccupied(state: HomeAssistantEntityState): boolean {
  return state.state !== "off";
}

export namespace OccupancySensingServer {
  export function createState(
    state: HomeAssistantEntityState,
  ): Behavior.Options<typeof OccupancySensingServer> {
    return {
      occupancy: { occupied: isOccupied(state) },
      occupancySensorType: OccupancySensing.OccupancySensorType.PhysicalContact,
      occupancySensorTypeBitmap: {
        pir: false,
        physicalContact: true,
        ultrasonic: false,
      },
    };
  }
}
