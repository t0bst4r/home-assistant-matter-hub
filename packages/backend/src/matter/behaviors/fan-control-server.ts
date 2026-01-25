import type { HomeAssistantEntityInformation } from "@home-assistant-matter-hub/common";
import type { ActionContext } from "@matter/main";
import { FanControlServer as Base } from "@matter/main/behaviors";
import { FanControl } from "@matter/main/clusters";
import { applyPatchState } from "../../utils/apply-patch-state.js";
import { FanMode } from "../../utils/converters/fan-mode.js";
import { FanSpeed } from "../../utils/converters/fan-speed.js";
import { transactionIsOffline } from "../../utils/transaction-is-offline.js";
import { HomeAssistantEntityBehavior } from "./home-assistant-entity-behavior.js";
import type { ValueGetter, ValueSetter } from "./utils/cluster-config.js";

import AirflowDirection = FanControl.AirflowDirection;

const defaultStepSize = 10;

const FeaturedBase = Base.with(
  "Step",
  "MultiSpeed",
  "AirflowDirection",
  "Auto",
);

export interface FanControlServerConfig {
  getPercentage: ValueGetter<number | undefined>;
  getStepSize: ValueGetter<number | undefined>;
  getAirflowDirection: ValueGetter<AirflowDirection | undefined>;
  isInAutoMode: ValueGetter<boolean>;

  turnOff: ValueSetter<void>;
  turnOn: ValueSetter<number>;
  setAutoMode: ValueSetter<void>;
  setAirflowDirection: ValueSetter<AirflowDirection>;
}

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
    const config = this.state.config;
    const percentage = config.getPercentage(entity.state, this.agent) ?? 0;
    const speedMax = Math.round(
      100 / (config.getStepSize(entity.state, this.agent) ?? defaultStepSize),
    );
    const speed = Math.ceil(speedMax * (percentage / 100));

    const fanModeSequence = this.getFanModeSequence();
    const fanMode = config.isInAutoMode(entity.state, this.agent)
      ? FanMode.create(FanControl.FanMode.Auto, fanModeSequence)
      : FanMode.fromSpeedPercent(percentage, fanModeSequence);

    applyPatchState(this.state, {
      percentSetting: percentage,
      percentCurrent: percentage,
      fanMode: fanMode.mode,
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
            airflowDirection: config.getAirflowDirection(
              entity.state,
              this.agent,
            ),
          }
        : {}),
    });
  }

  override step(request: FanControl.StepRequest) {
    const fanSpeed = new FanSpeed(this.state.speedCurrent, this.state.speedMax);
    this.targetSpeedSettingChanged(fanSpeed.step(request).currentSpeed);
  }

  private targetSpeedSettingChanged(
    speed: number | null,
    _oldValue?: number | null,
    context?: ActionContext,
  ) {
    if (transactionIsOffline(context)) {
      return;
    }
    if (speed == null) {
      return;
    }
    const percentSetting = Math.floor((speed / this.state.speedMax) * 100);
    this.targetPercentSettingChanged(
      percentSetting,
      this.state.percentSetting,
      context,
    );
  }

  private targetFanModeChanged(
    fanMode: FanControl.FanMode,
    _oldValue: FanControl.FanMode,
    context?: ActionContext,
  ) {
    if (transactionIsOffline(context)) {
      return;
    }
    const homeAssistant = this.agent.get(HomeAssistantEntityBehavior);
    if (!homeAssistant.isAvailable) {
      return;
    }
    const targetFanMode = FanMode.create(fanMode, this.state.fanModeSequence);
    const config = this.state.config;
    if (targetFanMode.mode === FanControl.FanMode.Auto) {
      homeAssistant.callAction(config.setAutoMode(void 0, this.agent));
    } else {
      const percentage = targetFanMode.speedPercent();
      this.targetPercentSettingChanged(
        percentage,
        this.state.percentSetting,
        context,
      );
    }
  }

  private targetPercentSettingChanged(
    percentage: number | null,
    _oldValue?: number | null,
    context?: ActionContext,
  ) {
    if (transactionIsOffline(context)) {
      return;
    }
    if (percentage == null) {
      return;
    }
    const homeAssistant = this.agent.get(HomeAssistantEntityBehavior);
    if (!homeAssistant.isAvailable) {
      return;
    }
    if (percentage === 0) {
      homeAssistant.callAction(this.state.config.turnOff(void 0, this.agent));
    } else {
      homeAssistant.callAction(
        this.state.config.turnOn(percentage, this.agent),
      );
    }
  }

  private targetAirflowDirectionChanged(
    airflowDirection: AirflowDirection,
    _oldValue: AirflowDirection,
    context?: ActionContext,
  ) {
    if (transactionIsOffline(context)) {
      return;
    }
    const homeAssistant = this.agent.get(HomeAssistantEntityBehavior);
    if (!homeAssistant.isAvailable) {
      return;
    }

    const config = this.state.config;
    homeAssistant.callAction(
      config.setAirflowDirection(airflowDirection, this.agent),
    );
  }

  private getFanModeSequence() {
    if (this.features.multiSpeed) {
      return this.features.auto
        ? FanControl.FanModeSequence.OffLowMedHighAuto
        : FanControl.FanModeSequence.OffLowMedHigh;
    }
    return this.features.auto
      ? FanControl.FanModeSequence.OffHighAuto
      : FanControl.FanModeSequence.OffHigh;
  }
}

export namespace FanControlServerBase {
  export class State extends FeaturedBase.State {
    config!: FanControlServerConfig;
  }
}

export function FanControlServer(config: FanControlServerConfig) {
  return FanControlServerBase.set({ config });
}
