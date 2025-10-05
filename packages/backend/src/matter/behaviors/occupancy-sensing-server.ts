import type {
  HomeAssistantEntityInformation,
  HomeAssistantEntityState,
} from "@home-assistant-matter-hub/common";
import { OccupancySensingServer as Base } from "@matter/main/behaviors";
import { OccupancySensing } from "@matter/main/clusters";
import { applyPatchState } from "../../utils/apply-patch-state.js";
import { HomeAssistantEntityBehavior } from "./home-assistant-entity-behavior.js";

export class OccupancySensingServer extends Base {
  override async initialize() {
    await super.initialize();
    const homeAssistant = await this.agent.load(HomeAssistantEntityBehavior);
    this.update(homeAssistant.entity);
    this.reactTo(homeAssistant.onChange, this.update);
  }

  private update({ state }: HomeAssistantEntityInformation) {
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
    return (
      this.agent.get(HomeAssistantEntityBehavior).isAvailable &&
      state.state !== "off"
    );
  }
}
