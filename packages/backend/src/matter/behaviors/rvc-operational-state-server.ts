import { RvcOperationalStateServer as Base } from "@matter/main/behaviors/rvc-operational-state";
import { HomeAssistantEntityBehavior } from "../custom-behaviors/home-assistant-entity-behavior.js";
import {
  HomeAssistantEntityInformation,
  VacuumDeviceState,
} from "@home-assistant-matter-hub/common";
import { applyPatchState } from "../../utils/apply-patch-state.js";
import { RvcOperationalState } from "@matter/main/clusters/rvc-operational-state";

export class RvcOperationalStateServer extends Base {
  override async initialize() {
    await super.initialize();
    const homeAssistant = await this.agent.load(HomeAssistantEntityBehavior);
    this.update(homeAssistant.entity);
    this.reactTo(homeAssistant.onChange, this.update);
  }

  private update(entity: HomeAssistantEntityInformation) {
    const state = entity.state.state as VacuumDeviceState;
    applyPatchState(this.state, {
      operationalState: this.getOperationalState(state),
      operationalError: {
        errorStateId: RvcOperationalState.ErrorState.Stuck,
      },
    });
  }

  private getOperationalState(
    state: VacuumDeviceState | "unavailable",
  ): number {
    switch (state) {
      case VacuumDeviceState.Docked:
        return RvcOperationalState.OperationalState.Docked;
      case VacuumDeviceState.Returning:
        return RvcOperationalState.OperationalState.SeekingCharger;
      case VacuumDeviceState.Cleaning:
        return 0x01;
      case VacuumDeviceState.Paused:
      case VacuumDeviceState.Idle:
        return 0x02;
      case VacuumDeviceState.Error:
      default:
        return 0x03;
    }
  }
}
