import { WindowCoveringServer as MBase } from "@project-chip/matter.js/behavior/definitions/window-covering";
import { haMixin } from "../mixins/ha-mixin.js";
import {
  CoverDeviceAttributes,
  HomeAssistantEntityState,
} from "@home-assistant-matter-hub/common";
import { Behavior } from "@project-chip/matter.js/behavior";
import { WindowCovering } from "@project-chip/matter.js/cluster";

const Base = MBase.with("Lift", "PositionAwareLift", "AbsolutePosition");

export interface WindowCoveringServerConfig {
  lift?: {
    /** @default true */
    invertPercentage?: boolean;
    /** @default false */
    swapOpenAndClosePercentage?: boolean;
  };
}

export function WindowCoveringServer(config?: WindowCoveringServerConfig) {
  return class ThisType extends haMixin("WindowCovering", Base) {
    override initialize(options?: {}) {
      this.endpoint.entityState.subscribe(this.update.bind(this));
      return super.initialize(options);
    }

    override async upOrOpen() {
      await super.upOrOpen();
      await this.callAction(
        "cover",
        "open_cover",
        {},
        { entity_id: this.entity.entity_id },
      );
    }

    override async downOrClose() {
      await super.downOrClose();
      await this.callAction(
        "cover",
        "close_cover",
        {},
        { entity_id: this.entity.entity_id },
      );
    }

    override async stopMotion() {
      super.stopMotion();
      await this.callAction(
        "cover",
        "stop_cover",
        {},
        { entity_id: this.entity.entity_id },
      );
    }

    override async goToLiftPercentage(
      request: WindowCovering.GoToLiftPercentageRequest,
    ) {
      super.goToLiftPercentage(request);
      const position = this.state.currentPositionLiftPercent100ths!;
      const targetPosition = convertLiftValue(position / 100, config?.lift);
      await this.callAction(
        "cover",
        "set_cover_position",
        {
          position: targetPosition,
        },
        {
          entity_id: this.entity.entity_id,
        },
      );
    }

    private async update(
      state: HomeAssistantEntityState<CoverDeviceAttributes>,
    ) {
      const current = this.endpoint.stateOf(ThisType);
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
      const expectedPosition = convertLiftValue(
        state.attributes.current_position,
        config?.lift,
      );
      const expectedPosition100ths =
        expectedPosition != null ? expectedPosition * 100 : actualPosition;

      if (
        expectedLiftMovement !== actualLiftMovement ||
        actualPosition !== expectedPosition100ths
      ) {
        await this.endpoint.setStateOf(ThisType, {
          currentPositionLiftPercent100ths:
            expectedPosition100ths != null ? expectedPosition100ths : undefined,
          operationalStatus: {
            global: expectedLiftMovement,
            lift: expectedLiftMovement,
          },
        });
      }
    }
  };
}

function convertLiftValue(
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

export namespace WindowCoveringServer {
  export function createState(
    state: HomeAssistantEntityState<CoverDeviceAttributes>,
    config: WindowCoveringServerConfig | undefined,
  ): Behavior.Options<typeof Base> {
    const initialPercentage = convertLiftValue(
      state.attributes.current_position,
      config?.lift,
    );
    const initialValue = initialPercentage ? initialPercentage * 100 : null;
    return {
      type: WindowCovering.WindowCoveringType.Rollershade,
      configStatus: {
        operational: true,
        onlineReserved: true,
        liftPositionAware: true,
        liftMovementReversed: false,
      },
      targetPositionLiftPercent100ths: initialValue,
      currentPositionLiftPercent100ths: initialValue,
      installedOpenLimitLift: 0,
      installedClosedLimitLift: 10000,
      operationalStatus: {
        global: WindowCovering.MovementStatus.Stopped,
        lift: WindowCovering.MovementStatus.Stopped,
      },
      endProductType: WindowCovering.EndProductType.RollerShade,
      mode: {},
    };
  }
}
