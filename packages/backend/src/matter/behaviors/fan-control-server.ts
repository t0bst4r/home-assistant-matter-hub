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

const FeaturedBase = Base.with("MultiSpeed", "AirflowDirection", "Auto");

export class FanControlServer extends FeaturedBase {
  declare state: FanControlServer.State;

  override async initialize() {
    super.initialize();
    const homeAssistant = await this.agent.load(HomeAssistantEntityBehavior);
    console.log(homeAssistant.entity.state);
    console.log(this.features);
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

    if ((supportedFeatures & FanDeviceFeature.SET_SPEED) == 0) {
      // Speed is not controllable, return a single speed level
      return 1;
    } else if (attributes.percentage_step) {
      // Speed resolution is advertised, use it
      return Math.round(100 / attributes.percentage_step);
    }
    return 100;
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

  private async targetSpeedSettingChanged(setting: number | null) {
    if (setting === null) {
      return;
    }

    const homeAssistant = this.agent.get(HomeAssistantEntityBehavior);
    if (homeAssistant.entity.state.state === "unavailable") {
      return;
    }
    const percentSetting = Math.floor((setting / this.state.speedMax) * 100);
    const currentAttributes = homeAssistant.entity.state
      .attributes as FanDeviceAttributes;
    if (currentAttributes.percentage == percentSetting) {
      return;
    }

    if (setting == 0) {
      await homeAssistant.callAction(
        "fan",
        "turn_off",
        {},
        { entity_id: homeAssistant.entityId },
      );
    } else if (setting > 0) {
      await homeAssistant.callAction(
        "fan",
        "turn_on",
        { percentage: percentSetting },
        { entity_id: homeAssistant.entityId },
      );
    }
  }

  private async targetPercentSettingChanged(setting: number | null) {
    if (setting === null) {
      return;
    }

    const homeAssistant = this.agent.get(HomeAssistantEntityBehavior);
    if (homeAssistant.entity.state.state === "unavailable") {
      return;
    }
    const currentAttributes = homeAssistant.entity.state
      .attributes as FanDeviceAttributes;
    if (currentAttributes.percentage == setting) {
      return;
    }

    const method = setting == 0 ? "turn_off" : "turn_on";
    const payload = setting == 0 ? {} : { percentage: setting };

    await homeAssistant.callAction("fan", method, payload, {
      entity_id: homeAssistant.entityId,
    });
  }

  private async targetFanModeChanged(setting: FanControl.FanMode) {
    const homeAssistant = this.agent.get(HomeAssistantEntityBehavior);
    if (homeAssistant.entity.state.state === "unavailable") {
      return;
    }
    const fanMode = this.getMatterFanMode(homeAssistant.entity);
    if (fanMode == setting) {
      return;
    }
    const method = setting == FanControl.FanMode.Off ? "turn_off" : "turn_on";
    const payload: { [id: string]: string } = {};
    if (
      setting == FanControl.FanMode.Auto ||
      setting == FanControl.FanMode.Smart
    ) {
      if (this.features.auto) {
        payload["preset_mode"] = "Auto";
      }
    }
    await homeAssistant.callAction("fan", method, payload, {
      entity_id: homeAssistant.entityId,
    });
  }

  private async targetAirflowDirectionChanged(
    setting: FanControl.AirflowDirection,
  ) {
    const homeAssistant = this.agent.get(HomeAssistantEntityBehavior);
    if (homeAssistant.entity.state.state === "unavailable") {
      return;
    }

    const currentAttributes = homeAssistant.entity.state
      .attributes as FanDeviceAttributes;
    if (
      this.getMatterAirflowDirection(currentAttributes.current_direction) ==
      setting
    ) {
      return;
    }
    await homeAssistant.callAction(
      "fan",
      "set_direction",
      { direction: this.getDirectionFromMatter(setting) },
      { entity_id: homeAssistant.entityId },
    );
  }
}

export namespace FanControlServer {
  export class State extends FeaturedBase.State {}
}
