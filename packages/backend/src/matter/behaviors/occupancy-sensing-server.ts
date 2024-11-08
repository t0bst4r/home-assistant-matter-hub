import { OccupancySensingServer as Base } from "@matter/main/behaviors";
import { HomeAssistantEntityState } from "@home-assistant-matter-hub/common";
import { OccupancySensing } from "@matter/main/clusters";
import { HomeAssistantBehavior } from "../custom-behaviors/home-assistant-behavior.js";

export class OccupancySensingServer extends Base {
  override async initialize() {
    await super.initialize();
    const homeAssistant = await this.agent.load(HomeAssistantBehavior);
    this.state.occupancy = {
      occupied: this.isOccupied(homeAssistant.state.entity),
    };
    this.state.occupancySensorType =
      OccupancySensing.OccupancySensorType.PhysicalContact;
    this.state.occupancySensorTypeBitmap = {
      pir: false,
      physicalContact: true,
      ultrasonic: false,
    };
    homeAssistant.onUpdate((s) => this.update(s));
  }

  private async update(state: HomeAssistantEntityState) {
    const current = this.endpoint.stateOf(OccupancySensingServer);
    const occupied = this.isOccupied(state);
    if (current.occupancy.occupied !== occupied) {
      await this.endpoint.setStateOf(OccupancySensingServer, {
        occupancy: { occupied },
      });
    }
  }

  private isOccupied(state: HomeAssistantEntityState): boolean {
    return state.state !== "off";
  }
}
