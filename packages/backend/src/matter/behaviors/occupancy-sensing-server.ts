import { OccupancySensingServer as Base } from "@matter/main/behaviors";
import { HomeAssistantEntityState } from "@home-assistant-matter-hub/common";
import { OccupancySensing } from "@matter/main/clusters";
import { HomeAssistantBehavior } from "../custom-behaviors/home-assistant-behavior.js";

export class OccupancySensingServer extends Base {
  override async initialize() {
    await super.initialize();
    const homeAssistant = await this.agent.load(HomeAssistantBehavior);
    Object.assign(this.state, {
      occupancy: { occupied: this.isOccupied(homeAssistant.state.entity) },
      occupancySensorType: OccupancySensing.OccupancySensorType.PhysicalContact,
      occupancySensorTypeBitmap: {
        pir: false,
        physicalContact: true,
        ultrasonic: false,
      },
    });
    this.reactTo(homeAssistant.onChange, this.update);
  }

  private async update(state: HomeAssistantEntityState) {
    const occupied = this.isOccupied(state);
    if (this.state.occupancy.occupied !== occupied) {
      this.state.occupancy = { occupied };
    }
  }

  private isOccupied(state: HomeAssistantEntityState): boolean {
    return state.state !== "off";
  }
}
