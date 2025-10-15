import type { HomeAssistantEntityInformation } from "@home-assistant-matter-hub/common";
import { LevelControlServer as Base } from "@matter/main/behaviors";
import type { LevelControl } from "@matter/main/clusters/level-control";
import { applyPatchState } from "../../utils/apply-patch-state.js";
import type { FeatureSelection } from "../../utils/feature-selection.js";
import { HomeAssistantEntityBehavior } from "./home-assistant-entity-behavior.js";
import type { ValueGetter, ValueSetter } from "./utils/cluster-config.js";

export interface LevelControlConfig {
  getValuePercent: ValueGetter<number | null>;
  moveToLevelPercent: ValueSetter<number>;
}

const FeaturedBase = Base.with("OnOff", "Lighting");

export class LevelControlServerBase extends FeaturedBase {
  declare state: LevelControlServerBase.State;

  override async initialize() {
    await super.initialize();
    const homeAssistant = await this.agent.load(HomeAssistantEntityBehavior);
    await this.update(homeAssistant.entity);
    this.reactTo(homeAssistant.onChange, this.update, { offline: true });
  }

  // Override Matter.js's handleOnOffChange to prevent synchronous transaction conflicts
  // The base implementation tries to update currentLevel synchronously when onOff changes
  override handleOnOffChange(_onOff: boolean) {
    // Do nothing - we handle level updates via our own update() method
    // This prevents the base class from causing synchronous lock conflicts
  }

  private async update({ state }: HomeAssistantEntityInformation) {
    const config = this.state.config;

    const minLevel = 1;
    const maxLevel = 0xfe;
    const levelRange = maxLevel - minLevel;

    const currentLevelPercent = config.getValuePercent(state, this.agent);
    let currentLevel =
      currentLevelPercent != null
        ? currentLevelPercent * levelRange + minLevel
        : null;

    if (currentLevel != null) {
      currentLevel = Math.min(Math.max(minLevel, currentLevel), maxLevel);
    }

    await applyPatchState(this.state, {
      minLevel: minLevel,
      maxLevel: maxLevel,
      currentLevel: currentLevel,
      onLevel: currentLevel ?? this.state.onLevel,
    });
  }

  override moveToLevelLogic(level: number) {
    const homeAssistant = this.agent.get(HomeAssistantEntityBehavior);
    const config = this.state.config;

    const levelRange = this.maxLevel - this.minLevel;
    const levelPercent = (level - this.minLevel) / levelRange;

    const current = config.getValuePercent(
      homeAssistant.entity.state,
      this.agent,
    );
    if (levelPercent === current) {
      return;
    }
    homeAssistant.callAction(
      config.moveToLevelPercent(levelPercent, this.agent),
    );
  }
}

export namespace LevelControlServerBase {
  export class State extends FeaturedBase.State {
    config!: LevelControlConfig;
  }
}

export type LevelControlFeatures = FeatureSelection<LevelControl.Cluster>;

export function LevelControlServer(config: LevelControlConfig) {
  return LevelControlServerBase.set({
    options: { executeIfOff: true },
    config,
  });
}
