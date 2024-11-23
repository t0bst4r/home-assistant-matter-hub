import {
  MovementDirection,
  MovementType,
  WindowCoveringServer as Base,
} from "@matter/main/behaviors";
import {
  CoverDeviceAttributes,
  HomeAssistantEntityState,
} from "@home-assistant-matter-hub/common";
import { WindowCovering } from "@matter/main/clusters";
import { HomeAssistantBehavior } from "../custom-behaviors/home-assistant-behavior.js";
import { applyPatchState } from "../../utils/apply-patch-state.js";
import { ClusterType } from "@matter/main/types";

const FeaturedBase = Base.with("Lift", "PositionAwareLift");

export class WindowCoveringServerBase extends FeaturedBase {
  declare state: WindowCoveringServerBase.State;

  override async initialize() {
    await super.initialize();
    const homeAssistant = await this.agent.load(HomeAssistantBehavior);
    this.update(homeAssistant.entity);
    this.reactTo(homeAssistant.onChange, this.update);
  }

  private update(state: HomeAssistantEntityState<CoverDeviceAttributes>) {
    const movementStatus: WindowCovering.MovementStatus | undefined =
      state.state === "opening"
        ? WindowCovering.MovementStatus.Opening
        : state.state === "closing"
          ? WindowCovering.MovementStatus.Closing
          : WindowCovering.MovementStatus.Stopped;

    let currentLift = this.convertLiftValue(state.attributes.current_position);
    if (currentLift != null) {
      currentLift *= 100;
    }
    applyPatchState<WindowCoveringServerBase.State>(this.state, {
      type: WindowCovering.WindowCoveringType.Rollershade,
      endProductType: WindowCovering.EndProductType.RollerShade,
      ...(this.features.positionAwareLift
        ? {
            currentPositionLiftPercent100ths: currentLift,
            targetPositionLiftPercent100ths:
              this.state.targetPositionLiftPercent100ths ?? currentLift,
            operationalStatus: {
              global: movementStatus,
              lift: movementStatus,
            },
          }
        : {
            operationalStatus: {
              global: movementStatus,
              lift: movementStatus,
            },
          }),
    });
  }

  override async handleMovement(
    type: MovementType,
    _: boolean,
    direction: MovementDirection,
    targetPercent100ths?: number,
  ) {
    if (type === MovementType.Lift) {
      if (targetPercent100ths != null && this.features.positionAwareLift) {
        await this.handleGoToPosition(targetPercent100ths);
      } else if (direction === MovementDirection.Open) {
        await this.handleOpen();
      } else if (direction === MovementDirection.Close) {
        await this.handleClose();
      }
    }
  }
  override async handleStopMovement() {
    const homeAssistant = this.agent.get(HomeAssistantBehavior);
    await homeAssistant.callAction(
      "cover",
      "stop_cover",
      {},
      { entity_id: homeAssistant.entityId },
    );
  }
  private async handleOpen() {
    const homeAssistant = this.agent.get(HomeAssistantBehavior);
    await homeAssistant.callAction(
      "cover",
      "open_cover",
      {},
      { entity_id: homeAssistant.entityId },
    );
  }
  private async handleClose() {
    const homeAssistant = this.agent.get(HomeAssistantBehavior);
    await homeAssistant.callAction(
      "cover",
      "close_cover",
      {},
      { entity_id: homeAssistant.entityId },
    );
  }

  private async handleGoToPosition(targetPercent100ths: number) {
    const homeAssistant = this.agent.get(HomeAssistantBehavior);
    const currentPosition = (
      homeAssistant.entity as HomeAssistantEntityState<CoverDeviceAttributes>
    ).attributes.current_position;
    const targetPosition = this.convertLiftValue(targetPercent100ths / 100);
    if (targetPosition == null || targetPosition === currentPosition) {
      return;
    }
    await homeAssistant.callAction(
      "cover",
      "set_cover_position",
      { position: targetPosition },
      { entity_id: homeAssistant.entityId },
    );
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
