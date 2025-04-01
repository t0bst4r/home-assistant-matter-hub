import { RvcOperationalStateServer as Base } from "@matter/main/behaviors/rvc-operational-state";
import { HomeAssistantEntityBehavior } from "../custom-behaviors/home-assistant-entity-behavior.js";
import {
  HomeAssistantEntityInformation,
  VacuumState,
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
    const state = entity.state.state as VacuumState;
    const operationalState = this.getOperationalState(state);
    applyPatchState(this.state, {
      operationalState,
      operationalError: {
        errorStateId:
          operationalState === RvcOperationalState.OperationalState.Error
            ? RvcOperationalState.ErrorState.Stuck
            : RvcOperationalState.ErrorState.NoError,
      },
    });
  }

  private getOperationalState(
    state: VacuumState | "unavailable",
  ): RvcOperationalState.OperationalState {
    switch (state) {
      case VacuumState.docked:
        return RvcOperationalState.OperationalState.Docked;
      case VacuumState.returning:
        return RvcOperationalState.OperationalState.SeekingCharger;
      case VacuumState.cleaning:
        return RvcOperationalState.OperationalState.Running;
      case VacuumState.paused:
      case VacuumState.idle:
        return RvcOperationalState.OperationalState.Paused;
      case VacuumState.error:
      default:
        return RvcOperationalState.OperationalState.Error;
    }
  }
}
