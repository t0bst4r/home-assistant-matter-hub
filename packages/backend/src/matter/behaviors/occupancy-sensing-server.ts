import { OccupancySensingServer as Base } from "@matter/main/behaviors";
import { HomeAssistantEntityState } from "@home-assistant-matter-hub/common";
import { OccupancySensing } from "@matter/main/clusters";
import { HomeAssistantBehavior } from "../custom-behaviors/home-assistant-behavior.js";
import { applyPatchState } from "../../utils/apply-patch-state.js";

export class OccupancySensingServer extends Base {
  override async initialize() {
    await super.initialize();
    const homeAssistant = await this.agent.load(HomeAssistantBehavior);
    this.update(homeAssistant.entity);
    this.reactTo(homeAssistant.onChange, this.update);
  }

  private update(state: HomeAssistantEntityState) {
    applyPatchState(this.state, {
      occupancy: { occupied: this.isOccupied(state) },
      occupancySensorType: OccupancySensing.OccupancySensorType.PhysicalContact,
      occupancySensorTypeBitmap: {
        pir: false,
        physicalContact: true,
        ultrasonic: false,
      },
    });
  }

  private isOccupied(state: HomeAssistantEntityState): boolean {
    return state.state !== "off";
  }
}
