import { FanControlServer as Base } from "@matter/main/behaviors";
import { FanControl } from "@matter/main/clusters";
import {
  FanDeviceAttributes,
  HomeAssistantEntityInformation,
} from "@home-assistant-matter-hub/common";
import { HomeAssistantEntityBehavior } from "../custom-behaviors/home-assistant-entity-behavior.js";
import { applyPatchState } from "../../utils/apply-patch-state.js";
import { ClusterType } from "@matter/main/types";
import * as utils from "./utils/fan-control-server-utils.js";
import { BridgeDataProvider } from "../bridge/bridge-data-provider.js";

const FeaturedBase = Base.with(
  "Step",
  "MultiSpeed",
  "AirflowDirection",
  "Auto",
);

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
    const { matterFans } = this.env.get(BridgeDataProvider).featureFlags;

    const attributes = entity.state.attributes as FanDeviceAttributes;
    const percentage = attributes.percentage ?? 0;
    const speedMax = Math.round(100 / (attributes.percentage_step ?? 100));
    const speed = Math.ceil(speedMax * (percentage * 0.01));

    const fanModeSequence = utils.getMatterFanModeSequence({
      auto: this.features.auto,
      multiSpeed: this.features.multiSpeed && matterFans === true,
    });

    applyPatchState(this.state, {
      percentSetting: percentage,
      percentCurrent: percentage,
      fanMode: utils.getMatterFanMode(
        entity.state.state,
        attributes.percentage,
        attributes.preset_mode,
        fanModeSequence,
      ),
      fanModeSequence: fanModeSequence,

      ...(this.features.multiSpeed
        ? {
            speedMax: speedMax,
            speedSetting: speed,
            speedCurrent: speed,
          }
        : {}),

      ...(this.features.airflowDirection
        ? {
            airflowDirection: utils.getMatterAirflowDirection(
              attributes.current_direction,
            ),
          }
        : {}),
    });
  }

  override async step(request: FanControl.StepRequest) {
    const next = utils.getNextStepValue(
      this.state.speedCurrent,
      this.state.speedMax,
      request,
    );
    await this.targetSpeedSettingChanged(next);
  }

  private async targetSpeedSettingChanged(speed: number | null) {
    if (speed == null) {
      return;
    }
    const percentSetting = Math.floor((speed / this.state.speedMax) * 100);
    await this.targetPercentSettingChanged(percentSetting);
  }

  private async targetPercentSettingChanged(percentage: number | null) {
    if (percentage == null) {
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

    if (percentage == 0) {
      await homeAssistant.callAction("fan.turn_off");
    } else {
      await homeAssistant.callAction("fan.turn_on", { percentage });
    }
  }

  private async targetFanModeChanged(fanMode: FanControl.FanMode) {
    const homeAssistant = this.agent.get(HomeAssistantEntityBehavior);
    if (!homeAssistant.isAvailable) {
      return;
    }

    let validMode = fanMode;
    if (validMode === FanControl.FanMode.On) {
      validMode = FanControl.FanMode.High;
    }
    if (validMode === FanControl.FanMode.Smart) {
      validMode = FanControl.FanMode.Auto;
    }
    if (validMode === FanControl.FanMode.Auto && !this.features.auto) {
      validMode = FanControl.FanMode.High;
    }

    const attributes = homeAssistant.entity.state
      .attributes as FanDeviceAttributes;
    const current = utils.getMatterFanMode(
      homeAssistant.entity.state.state,
      attributes.percentage,
      attributes.preset_mode,
      this.state.fanModeSequence,
    );

    if (validMode === current) {
      return;
    }

    if (validMode === FanControl.FanMode.Auto) {
      await homeAssistant.callAction("fan.turn_on", { preset_mode: "Auto" });
    } else {
      const percentage = utils.getSpeedPercentFromMatterFanMode(
        validMode,
        this.state.fanModeSequence,
      );
      await this.targetPercentSettingChanged(percentage);
    }
  }

  private async targetAirflowDirectionChanged(
    airflowDirection: FanControl.AirflowDirection,
  ) {
    const homeAssistant = this.agent.get(HomeAssistantEntityBehavior);
    if (!homeAssistant.isAvailable) {
      return;
    }

    const currentAttributes = homeAssistant.entity.state
      .attributes as FanDeviceAttributes;
    const current = currentAttributes.current_direction;
    const direction = utils.getDirectionFromMatter(airflowDirection);
    if (current == direction) {
      return;
    }
    await homeAssistant.callAction("fan.set_direction", { direction });
  }
}

export namespace FanControlServerBase {
  export class State extends FeaturedBase.State {}
}

export class FanControlServer extends FanControlServerBase.for(
  ClusterType(FanControl.Base),
) {}
