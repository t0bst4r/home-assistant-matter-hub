import { WindowCoveringServer as Base } from "@project-chip/matter.js/behaviors/window-covering";
import {
  CoverDeviceAttributes,
  HomeAssistantEntityState,
} from "@home-assistant-matter-hub/common";
import { WindowCovering } from "@project-chip/matter.js/cluster";
import { HomeAssistantBehavior } from "../custom-behaviors/home-assistant-behavior.js";

export interface WindowCoveringServerConfig {
  lift?: {
    /** @default true */
    invertPercentage?: boolean;
    /** @default false */
    swapOpenAndClosePercentage?: boolean;
  };
}

const FeaturedBase = Base.with("Lift", "PositionAwareLift", "AbsolutePosition");

export class WindowCoveringServer extends FeaturedBase {
  declare state: WindowCoveringServer.State;

  override async initialize() {
    await super.initialize();
    const homeAssistant = await this.agent.load(HomeAssistantBehavior);

    const initialPercentage = this.convertLiftValue(
      (homeAssistant.state.entity.attributes as CoverDeviceAttributes)
        .current_position,
      this.state.config?.lift,
    );
    const initialValue = initialPercentage ? initialPercentage * 100 : null;
    this.state.type = WindowCovering.WindowCoveringType.Rollershade;
    this.state.configStatus = {
      operational: true,
      onlineReserved: true,
      liftPositionAware: true,
      liftMovementReversed: false,
    };
    this.state.targetPositionLiftPercent100ths = initialValue;
    this.state.currentPositionLiftPercent100ths = initialValue;
    this.state.installedOpenLimitLift = 0;
    this.state.installedClosedLimitLift = 10000;
    this.state.operationalStatus = {
      global: WindowCovering.MovementStatus.Stopped,
      lift: WindowCovering.MovementStatus.Stopped,
    };
    this.state.endProductType = WindowCovering.EndProductType.RollerShade;
    this.state.mode = {};
    homeAssistant.onUpdate((s) => this.update(s));
  }

  override async upOrOpen() {
    await super.upOrOpen();
    const homeAssistant = this.agent.get(HomeAssistantBehavior);
    await homeAssistant.callAction(
      "cover",
      "open_cover",
      {},
      { entity_id: homeAssistant.state.entity.entity_id },
    );
  }

  override async downOrClose() {
    await super.downOrClose();
    const homeAssistant = this.agent.get(HomeAssistantBehavior);
    await homeAssistant.callAction(
      "cover",
      "close_cover",
      {},
      { entity_id: homeAssistant.state.entity.entity_id },
    );
  }

  override async stopMotion() {
    super.stopMotion();
    const homeAssistant = this.agent.get(HomeAssistantBehavior);
    await homeAssistant.callAction(
      "cover",
      "stop_cover",
      {},
      { entity_id: homeAssistant.state.entity.entity_id },
    );
  }

  override async goToLiftPercentage(
    request: WindowCovering.GoToLiftPercentageRequest,
  ) {
    super.goToLiftPercentage(request);
    const position = this.state.currentPositionLiftPercent100ths!;
    const targetPosition = this.convertLiftValue(
      position / 100,
      this.state.config?.lift,
    );
    const homeAssistant = this.agent.get(HomeAssistantBehavior);
    await homeAssistant.callAction(
      "cover",
      "set_cover_position",
      {
        position: targetPosition,
      },
      {
        entity_id: homeAssistant.state.entity.entity_id,
      },
    );
  }

  private async update(state: HomeAssistantEntityState<CoverDeviceAttributes>) {
    const current = this.endpoint.stateOf(WindowCoveringServer);
    const actualLiftMovement =
      current.operationalStatus.lift ?? WindowCovering.MovementStatus.Stopped;
    let expectedLiftMovement: WindowCovering.MovementStatus | undefined =
      actualLiftMovement;
    if (state.state === "open" || state.state === "closed") {
      expectedLiftMovement = WindowCovering.MovementStatus.Stopped;
    } else if (state.state === "opening") {
      expectedLiftMovement = WindowCovering.MovementStatus.Opening;
    } else if (state.state === "closing") {
      expectedLiftMovement = WindowCovering.MovementStatus.Closing;
    }

    const actualPosition = current.currentPositionLiftPercent100ths;
    const expectedPosition = this.convertLiftValue(
      state.attributes.current_position,
      this.state.config?.lift,
    );
    const expectedPosition100ths =
      expectedPosition != null ? expectedPosition * 100 : actualPosition;

    if (
      expectedLiftMovement !== actualLiftMovement ||
      actualPosition !== expectedPosition100ths
    ) {
      await this.endpoint.setStateOf(WindowCoveringServer, {
        currentPositionLiftPercent100ths:
          expectedPosition100ths != null ? expectedPosition100ths : undefined,
        operationalStatus: {
          global: expectedLiftMovement,
          lift: expectedLiftMovement,
        },
      });
    }
  }

  private convertLiftValue(
    percentage: number | undefined | null,
    config: WindowCoveringServerConfig["lift"] | undefined,
  ): number | null {
    if (percentage == null) {
      return null;
    }
    const invert = config?.invertPercentage ?? true;
    let result = percentage;
    if (invert) {
      result = 100 - result;
    }
    const swap = config?.swapOpenAndClosePercentage ?? false;
    if (swap) {
      if (result >= 99.95) {
        result = 0;
      } else if (result <= 0.05) {
        result = 100;
      }
    }
    return result;
  }
}

export namespace WindowCoveringServer {
  export class State extends FeaturedBase.State {
    config?: WindowCoveringServerConfig;
  }
}
