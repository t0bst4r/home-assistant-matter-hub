import type { HomeAssistantEntityInformation } from "@home-assistant-matter-hub/common";
import { FanControlServer as Base } from "@matter/main/behaviors";
import { FanControl } from "@matter/main/clusters";
import { applyPatchState } from "../../utils/apply-patch-state.js";
import { FanMode } from "../../utils/converters/fan-mode.js";
import { FanSpeed } from "../../utils/converters/fan-speed.js";
import { BridgeDataProvider } from "../bridge/bridge-data-provider.js";
import { HomeAssistantEntityBehavior } from "../custom-behaviors/home-assistant-entity-behavior.js";
import type { ValueGetter, ValueSetter } from "./utils/cluster-config.js";
import AirflowDirection = FanControl.AirflowDirection;
import type {
  Feature,
  FeatureSelection,
} from "../../utils/feature-selection.js";

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
      { offline: true },
    );
    this.reactTo(this.events.fanMode$Changed, this.targetFanModeChanged, {
      offline: true,
    });
    if (this.features.multiSpeed) {
      this.reactTo(
        this.events.speedSetting$Changed,
        this.targetSpeedSettingChanged,
        { offline: true },
      );
    }
    if (this.features.airflowDirection) {
      this.reactTo(
        this.events.airflowDirection$Changed,
        this.targetAirflowDirectionChanged,
        { offline: true },
      );
    }
  }

  private update(entity: HomeAssistantEntityInformation) {
    const config = this.state.config;
    const percentage = config.getPercentage(entity.state, this.agent) ?? 0;
    const speedMax = Math.round(
      100 / (config.getStepSize(entity.state, this.agent) ?? 100),
    );
    const speed = Math.ceil(speedMax * (percentage * 0.01));

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

  override async step(request: FanControl.StepRequest) {
    const fanSpeed = new FanSpeed(this.state.speedCurrent, this.state.speedMax);
    await this.targetSpeedSettingChanged(fanSpeed.step(request).currentSpeed);
  }

  private async targetSpeedSettingChanged(speed: number | null) {
    if (speed == null) {
      return;
    }
    const percentSetting = Math.floor((speed / this.state.speedMax) * 100);
    await this.targetPercentSettingChanged(percentSetting);
  }

  private async targetFanModeChanged(fanMode: FanControl.FanMode) {
    const homeAssistant = this.agent.get(HomeAssistantEntityBehavior);
    if (!homeAssistant.isAvailable) {
      return;
    }

    const targetFanMode = FanMode.create(fanMode, this.state.fanModeSequence);

    const config = this.state.config;
    const current = config.isInAutoMode(homeAssistant.entity.state, this.agent)
      ? FanMode.create(FanControl.FanMode.Auto, this.state.fanModeSequence)
      : FanMode.fromSpeedPercent(
          this.state.speedCurrent,
          this.state.fanModeSequence,
        );

    if (targetFanMode.equals(current)) {
      return;
    }

    if (targetFanMode.mode === FanControl.FanMode.Auto) {
      await homeAssistant.callAction(config.setAutoMode(void 0, this.agent));
    } else {
      const percentage = targetFanMode.speedPercent();
      await this.targetPercentSettingChanged(percentage);
    }
  }

  private async targetPercentSettingChanged(percentage: number | null) {
    if (percentage == null) {
      return;
    }
    const homeAssistant = this.agent.get(HomeAssistantEntityBehavior);
    if (!homeAssistant.isAvailable) {
      return;
    }

    const current = this.state.config.getPercentage(
      homeAssistant.entity.state,
      this.agent,
    );
    if (current === percentage) {
      return;
    }

    if (percentage === 0) {
      await homeAssistant.callAction(
        this.state.config.turnOff(void 0, this.agent),
      );
    } else {
      await homeAssistant.callAction(
        this.state.config.turnOn(percentage, this.agent),
      );
    }
  }

  private async targetAirflowDirectionChanged(
    airflowDirection: AirflowDirection,
  ) {
    const homeAssistant = this.agent.get(HomeAssistantEntityBehavior);
    if (!homeAssistant.isAvailable) {
      return;
    }

    const config = this.state.config;
    const current = config.getAirflowDirection(
      homeAssistant.entity.state,
      this.agent,
    );

    if (current === airflowDirection) {
      return;
    }

    await homeAssistant.callAction(
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
  const server = FanControlServerBase.set({ config });
  return {
    with: (features: FeatureSelection<FanControl.Cluster>) =>
      server.with(...features),
  };
}
