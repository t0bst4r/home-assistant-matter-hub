import { OccupancySensingServer as Base } from "@project-chip/matter.js/behaviors/occupancy-sensing";
import { HomeAssistantEntityState } from "@home-assistant-matter-hub/common";
import { OccupancySensing } from "@project-chip/matter.js/cluster";
import { HomeAssistantBehavior } from "../custom-behaviors/home-assistant-behavior.js";

export class OccupancySensingServer extends Base {
  override async initialize() {
    await super.initialize();
    const homeAssistant = await this.agent.load(HomeAssistantBehavior);
    this.state.occupancy = { occupied: isOccupied(homeAssistant.state.entity) };
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
