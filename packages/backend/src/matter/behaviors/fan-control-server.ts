import { FanControlServer as Base } from "@matter/main/behaviors";
import { FanControl } from "@matter/main/clusters";
import {
  FanDeviceAttributes,
  FanDeviceDirection,
  FanDeviceFeature,
  HomeAssistantEntityInformation,
} from "@home-assistant-matter-hub/common";
import { HomeAssistantEntityBehavior } from "../custom-behaviors/home-assistant-entity-behavior.js";
import { applyPatchState } from "../../utils/apply-patch-state.js";
import { testBit } from "../../utils/test-bit.js";
import { ClusterType } from "@matter/main/types";

const FeaturedBase = Base.with("MultiSpeed", "AirflowDirection", "Auto");

export class FanControlServerBase extends FeaturedBase {
  declare state: FanControlServerBase.State;

  override async initialize() {
    super.initialize();
    const homeAssistant = await this.agent.load(HomeAssistantEntityBehavior);
    this.update(homeAssistant.entity);
    this.reactTo(homeAssistant.onChange, this.update);
    this.reactTo(
      this.events.percentSetting$Changed,
      this.targetPercentSettingChanged,
    );
    this.reactTo(this.events.fanMode$Changed, this.targetFanModeChanged);
    if (this.features.multiSpeed) {
      this.reactTo(
        this.events.speedSetting$Changed,
        this.targetSpeedSettingChanged,
      );
    }
    if (this.features.airflowDirection) {
      this.reactTo(
        this.events.airflowDirection$Changed,
        this.targetAirflowDirectionChanged,
      );
    }
  }

  private update(entity: HomeAssistantEntityInformation) {
    const attributes = entity.state.attributes as FanDeviceAttributes;
    const fanMode = this.getMatterFanMode(entity);
    const isAuto = fanMode == FanControl.FanMode.Auto;
    const percent = attributes.percentage ?? 0;
    const speedMax = this.getSpeedMax(entity);
    const speed = Math.ceil(speedMax * (percent * 0.01));

    applyPatchState(this.state, {
      percentSetting: isAuto ? 0 : percent,
      percentCurrent: percent,
      fanMode: fanMode,
      fanModeSequence: this.features.auto
        ? FanControl.FanModeSequence.OffHighAuto
        : FanControl.FanModeSequence.OffHigh,

      ...(this.features.multiSpeed
        ? {
            speedMax: speedMax,
            speedSetting: isAuto ? 0 : speed,
            speedCurrent: speed,
          }
        : {}),

      ...(this.features.airflowDirection
        ? {
            airflowDirection: this.getMatterAirflowDirection(
              attributes.current_direction,
            ),
          }
        : {}),
    });
  }

  private async targetSpeedSettingChanged(speed: number | null) {
    if (speed === null) {
      return;
    }
    const percentSetting = Math.floor((speed / this.state.speedMax) * 100);
    await this.targetPercentSettingChanged(percentSetting);
  }

  private async targetPercentSettingChanged(percentage: number | null) {
    if (percentage === null) {
      return;
    }
    const homeAssistant = this.agent.get(HomeAssistantEntityBehavior);
    if (!homeAssistant.isAvailable) {
      return;
    }
    const currentAttributes = homeAssistant.entity.state
      .attributes as FanDeviceAttributes;
    const current = currentAttributes.percentage;
    if (current == percentage) {
      return;
    }
    const method = percentage == 0 ? "turn_off" : "turn_on";
    const payload = percentage == 0 ? {} : { percentage: percentage };
    await homeAssistant.callAction("fan", method, payload, {
      entity_id: homeAssistant.entityId,
    });
  }

  private async targetFanModeChanged(fanMode: FanControl.FanMode) {
    const homeAssistant = this.agent.get(HomeAssistantEntityBehavior);
    if (!homeAssistant.isAvailable) {
      return;
    }
    const current = this.getMatterFanMode(homeAssistant.entity);
    if (current == fanMode) {
      return;
    }
    const method = fanMode == FanControl.FanMode.Off ? "turn_off" : "turn_on";
    const data =
      this.features.auto &&
      [FanControl.FanMode.Auto, FanControl.FanMode.Smart].includes(fanMode)
        ? { preset_mode: "Auto" }
        : {};
    await homeAssistant.callAction("fan", method, data, {
      entity_id: homeAssistant.entityId,
    });
  }

  private async targetAirflowDirectionChanged(
    direction: FanControl.AirflowDirection,
  ) {
    const homeAssistant = this.agent.get(HomeAssistantEntityBehavior);
    if (!homeAssistant.isAvailable) {
      return;
    }

    const currentAttributes = homeAssistant.entity.state
      .attributes as FanDeviceAttributes;
    const current = this.getMatterAirflowDirection(
      currentAttributes.current_direction,
    );
    if (current == direction) {
      return;
    }
    await homeAssistant.callAction(
      "fan",
      "set_direction",
      { direction: this.getDirectionFromMatter(direction) },
      { entity_id: homeAssistant.entityId },
    );
  }

  private getMatterFanMode(
    entity: HomeAssistantEntityInformation,
  ): FanControl.FanMode {
    const attributes = entity.state.attributes as FanDeviceAttributes;
    if (entity.state.state == "off") {
      return FanControl.FanMode.Off;
    } else if (this.features.auto && attributes.preset_mode == "Auto") {
      return FanControl.FanMode.Auto;
    }
    return FanControl.FanMode.High;
  }

  private getMatterAirflowDirection(
    direction?: FanDeviceDirection,
  ): FanControl.AirflowDirection | undefined {
    if (direction == FanDeviceDirection.FORWARD) {
      return FanControl.AirflowDirection.Forward;
    } else if (direction == FanDeviceDirection.REVERSE) {
      return FanControl.AirflowDirection.Reverse;
    }
    return undefined;
  }

  private getDirectionFromMatter(
    direction: FanControl.AirflowDirection,
  ): FanDeviceDirection {
    if (direction == FanControl.AirflowDirection.Forward) {
      return FanDeviceDirection.FORWARD;
    }
    return FanDeviceDirection.REVERSE;
  }

  private getSpeedMax(entity: HomeAssistantEntityInformation): number {
    const attributes = entity.state.attributes as FanDeviceAttributes;
    const supportedFeatures = attributes.supported_features ?? 0;

    if (!testBit(supportedFeatures, FanDeviceFeature.SET_SPEED)) {
      // Speed is not controllable, return a single speed level
      return 1;
    } else if (attributes.percentage_step) {
      // Speed resolution is advertised, use it
      return Math.round(100 / attributes.percentage_step);
    }
    return 100;
  }
}

export namespace FanControlServerBase {
  export class State extends FeaturedBase.State {}
}

export class FanControlServer extends FanControlServerBase.for(
  ClusterType(FanControl.Base),
) {}
