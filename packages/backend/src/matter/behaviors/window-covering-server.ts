import {
  MovementDirection,
  MovementType,
  WindowCoveringServer as Base,
} from "@matter/main/behaviors";
import {
  CoverDeviceAttributes,
  CoverDeviceState,
  HomeAssistantEntityInformation,
  HomeAssistantEntityState,
} from "@home-assistant-matter-hub/common";
import { WindowCovering } from "@matter/main/clusters";
import { HomeAssistantEntityBehavior } from "../custom-behaviors/home-assistant-entity-behavior.js";
import { applyPatchState } from "../../utils/apply-patch-state.js";
import { ClusterType } from "@matter/main/types";

const FeaturedBase = Base.with("Lift", "PositionAwareLift", "AbsolutePosition");

export class WindowCoveringServerBase extends FeaturedBase {
  declare state: WindowCoveringServerBase.State;

  override async initialize() {
    await super.initialize();
    const homeAssistant = await this.agent.load(HomeAssistantEntityBehavior);
    this.update(homeAssistant.entity);
    this.reactTo(homeAssistant.onChange, this.update);
  }

  private update(entity: HomeAssistantEntityInformation) {
    const state =
      entity.state as HomeAssistantEntityState<CoverDeviceAttributes>;
    const coverState = state.state as CoverDeviceState;
    const movementStatus: WindowCovering.MovementStatus =
      coverState === CoverDeviceState.opening
        ? WindowCovering.MovementStatus.Opening
        : coverState === CoverDeviceState.closing
          ? WindowCovering.MovementStatus.Closing
          : WindowCovering.MovementStatus.Stopped;

    let currentLift = this.convertLiftValue(state.attributes.current_position);
    if (currentLift != null) {
      currentLift *= 100;
    } else {
      if (coverState === CoverDeviceState.open) {
        currentLift = 0;
      } else if (state.state === "closed") {
        currentLift = 100_00;
      }
    }
    applyPatchState<WindowCoveringServerBase.State>(this.state, {
      type: WindowCovering.WindowCoveringType.Rollershade,
      endProductType: WindowCovering.EndProductType.RollerShade,
      operationalStatus: {
        global: movementStatus,
        lift: movementStatus,
      },
      ...(this.features.absolutePosition
        ? {
            installedOpenLimitLift: 0,
            installedCloseLimit: 100_00,
            currentPositionLift: currentLift,
          }
        : {}),
      ...(this.features.positionAwareLift
        ? {
            currentPositionLiftPercent100ths: currentLift,
            targetPositionLiftPercent100ths:
              this.state.targetPositionLiftPercent100ths ?? currentLift,
          }
        : {}),
    });
  }

  override async handleMovement(
    type: MovementType,
    _: boolean,
    direction: MovementDirection,
    targetPercent100ths?: number,
  ) {
    if (type === MovementType.Lift) {
      if (targetPercent100ths != null && this.features.absolutePosition) {
        await this.handleGoToPosition(targetPercent100ths);
      } else if (
        direction === MovementDirection.Close ||
        (targetPercent100ths != null && targetPercent100ths > 0)
      ) {
        await this.handleClose();
      } else if (direction === MovementDirection.Open) {
        await this.handleOpen();
      }
    }
  }
  override async handleStopMovement() {
    const homeAssistant = this.agent.get(HomeAssistantEntityBehavior);
    await homeAssistant.callAction("cover.stop_cover");
  }
  private async handleOpen() {
    const homeAssistant = this.agent.get(HomeAssistantEntityBehavior);
    await homeAssistant.callAction("cover.open_cover");
  }
  private async handleClose() {
    const homeAssistant = this.agent.get(HomeAssistantEntityBehavior);
    await homeAssistant.callAction("cover.close_cover");
  }

  private async handleGoToPosition(targetPercent100ths: number) {
    const homeAssistant = this.agent.get(HomeAssistantEntityBehavior);
    const attributes = homeAssistant.entity.state
      .attributes as CoverDeviceAttributes;
    const currentPosition = attributes.current_position;
    const targetPosition = this.convertLiftValue(targetPercent100ths / 100);
    if (targetPosition == null || targetPosition === currentPosition) {
      return;
    }
    await homeAssistant.callAction("cover.set_cover_position", {
      position: targetPosition,
    });
  }

  private convertLiftValue(
    percentage: number | undefined | null,
  ): number | null {
    if (percentage == null) {
      return null;
    }
    return 100 - percentage;
  }
}

export namespace WindowCoveringServerBase {
  export class State extends FeaturedBase.State {}
}

export class WindowCoveringServer extends WindowCoveringServerBase.for(
  ClusterType(WindowCovering.Base),
) {}
