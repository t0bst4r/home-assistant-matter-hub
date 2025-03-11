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
import { convertCoverValue } from "./utils/window-covering-server-utils.js";

export interface WindowCoveringConfig {
  invertPercentage?: boolean;
  swapOpenAndClose?: boolean;
}

const FeaturedBase = Base.with(
  "Lift",
  "PositionAwareLift",
  "AbsolutePosition",
  "Tilt",
  "PositionAwareTilt",
);

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

    const currentLift = this.getCurrentPosition(
      state.attributes.current_position,
      coverState,
    );
    const currentTilt = this.getCurrentPosition(
      state.attributes.current_tilt_position,
      coverState,
    );

    applyPatchState<WindowCoveringServerBase.State>(this.state, {
      type:
        this.features.lift && this.features.tilt
          ? WindowCovering.WindowCoveringType.TiltBlindLift
          : this.features.tilt
            ? WindowCovering.WindowCoveringType.TiltBlindTiltOnly
            : WindowCovering.WindowCoveringType.Rollershade,
      endProductType:
        this.features.lift && this.features.tilt
          ? WindowCovering.EndProductType.SheerShade
          : this.features.tilt
            ? WindowCovering.EndProductType.TiltOnlyInteriorBlind
            : WindowCovering.EndProductType.RollerShade,
      operationalStatus: {
        global: movementStatus,
        ...(this.features.lift ? { lift: movementStatus } : {}),
        ...(this.features.tilt ? { tilt: movementStatus } : {}),
      },
      ...(this.features.absolutePosition && this.features.lift
        ? {
            installedOpenLimitLift: 0,
            installedClosedLimitLift: 100_00,
            currentPositionLift: currentLift,
          }
        : {}),
      ...(this.features.absolutePosition && this.features.tilt
        ? {
            installedOpenLimitTilt: 0,
            installedClosedLimitTilt: 100_00,
            currentPositionTilt: currentTilt,
          }
        : {}),
      ...(this.features.positionAwareLift
        ? {
            currentPositionLiftPercent100ths: currentLift,
            targetPositionLiftPercent100ths:
              this.state.targetPositionLiftPercent100ths ?? currentLift,
          }
        : {}),
      ...(this.features.positionAwareTilt
        ? {
            currentPositionTiltPercent100ths: currentTilt,
            targetPositionTiltPercent100ths:
              this.state.targetPositionTiltPercent100ths ?? currentTilt,
          }
        : {}),
    });
  }

  private getCurrentPosition(
    percentage: number | undefined,
    coverState: CoverDeviceState,
  ) {
    let currentValue = this.convertValue(percentage);
    if (currentValue != null) {
      currentValue *= 100;
      currentValue = Math.abs(currentValue);
      if (currentValue > 100_00) {
        currentValue = 100_00;
      }
    } else {
      if (coverState === CoverDeviceState.open) {
        currentValue = 0;
      } else if (coverState === CoverDeviceState.closed) {
        currentValue = 100_00;
      }
    }
    return currentValue;
  }

  override async handleMovement(
    type: MovementType,
    _: boolean,
    direction: MovementDirection,
    targetPercent100ths?: number,
  ) {
    if (type === MovementType.Lift) {
      if (targetPercent100ths != null && this.features.absolutePosition) {
        await this.handleGoToLiftPosition(targetPercent100ths);
      } else if (
        direction === MovementDirection.Close ||
        (targetPercent100ths != null && targetPercent100ths > 0)
      ) {
        await this.handleLiftClose();
      } else if (direction === MovementDirection.Open) {
        await this.handleLiftOpen();
      }
    } else if (type === MovementType.Tilt) {
      if (targetPercent100ths != null && this.features.absolutePosition) {
        await this.handleGoToTiltPosition(targetPercent100ths);
      } else if (
        direction === MovementDirection.Close ||
        (targetPercent100ths != null && targetPercent100ths > 0)
      ) {
        await this.handleTiltClose();
      } else if (direction === MovementDirection.Open) {
        await this.handleTiltOpen();
      }
    }
  }
  override async handleStopMovement() {
    const homeAssistant = this.agent.get(HomeAssistantEntityBehavior);
    await homeAssistant.callAction("cover.stop_cover");
  }

  private async handleLiftOpen() {
    const homeAssistant = this.agent.get(HomeAssistantEntityBehavior);
    await homeAssistant.callAction("cover.open_cover");
  }
  private async handleLiftClose() {
    const homeAssistant = this.agent.get(HomeAssistantEntityBehavior);
    await homeAssistant.callAction("cover.close_cover");
  }
  private async handleGoToLiftPosition(targetPercent100ths: number) {
    const homeAssistant = this.agent.get(HomeAssistantEntityBehavior);
    const attributes = homeAssistant.entity.state
      .attributes as CoverDeviceAttributes;
    const currentPosition = attributes.current_position;
    const targetPosition = this.convertValue(targetPercent100ths / 100);
    if (targetPosition == null || targetPosition === currentPosition) {
      return;
    }
    await homeAssistant.callAction("cover.set_cover_position", {
      position: targetPosition,
    });
  }

  private async handleTiltOpen() {
    const homeAssistant = this.agent.get(HomeAssistantEntityBehavior);
    await homeAssistant.callAction("cover.open_cover_tilt");
  }
  private async handleTiltClose() {
    const homeAssistant = this.agent.get(HomeAssistantEntityBehavior);
    await homeAssistant.callAction("cover.close_cover_tilt");
  }
  private async handleGoToTiltPosition(targetPercent100ths: number) {
    const homeAssistant = this.agent.get(HomeAssistantEntityBehavior);
    const attributes = homeAssistant.entity.state
      .attributes as CoverDeviceAttributes;
    const currentPosition = attributes.current_tilt_position;
    const targetPosition = this.convertValue(targetPercent100ths / 100);
    if (targetPosition == null || targetPosition === currentPosition) {
      return;
    }
    await homeAssistant.callAction("cover.set_cover_tilt_position", {
      tilt_position: targetPosition,
    });
  }

  private convertValue(percentage: number | undefined | null): number | null {
    if (percentage == -1) {
      percentage = 0;
    }
    return convertCoverValue(
      percentage,
      this.state.config?.invertPercentage == true,
      this.state.config?.swapOpenAndClose == true,
    );
  }
}

export namespace WindowCoveringServerBase {
  export class State extends FeaturedBase.State {
    config?: WindowCoveringConfig;
  }
}

export class WindowCoveringServer extends WindowCoveringServerBase.for(
  ClusterType(WindowCovering.Base),
) {}
