import type {
  HomeAssistantEntityInformation,
  HomeAssistantEntityState,
} from "@home-assistant-matter-hub/common";
import { LevelControlServer as Base } from "@matter/main/behaviors";
import { LevelControl } from "@matter/main/clusters";
import { ClusterType } from "@matter/main/types";
import { applyPatchState } from "../../utils/apply-patch-state.js";
import { HomeAssistantEntityBehavior } from "../custom-behaviors/home-assistant-entity-behavior.js";

export interface LevelControlConfig {
  getValue: (state: HomeAssistantEntityState) => number | null;
  getMinValue?: (state: HomeAssistantEntityState) => number | undefined;
  getMaxValue?: (state: HomeAssistantEntityState) => number | undefined;
  expandMinMaxForValue?: boolean;
  moveToLevel: {
    action: string;
    data: (value: number) => object;
  };
}

const FeaturedBase = Base.with(
  LevelControl.Feature.OnOff,
  LevelControl.Feature.Lighting,
);

export class LevelControlServerBase extends FeaturedBase {
  declare state: LevelControlServerBase.State;

  override async initialize() {
    super.initialize();
    const homeAssistant = await this.agent.load(HomeAssistantEntityBehavior);
    this.update(homeAssistant.entity);
    this.reactTo(homeAssistant.onChange, this.update);
  }

  private update({ state }: HomeAssistantEntityInformation) {
    let minLevel =
      this.validValue(this.state.config.getMinValue?.(state)) ?? undefined;
    let maxLevel =
      this.validValue(this.state.config.getMaxValue?.(state)) ?? undefined;
    const currentLevel =
      this.validValue(this.state.config.getValue(state)) ??
      this.state.currentLevel;

    if (this.state.config?.expandMinMaxForValue === true) {
      if (minLevel != null) {
        minLevel = Math.min(minLevel, currentLevel ?? Number.POSITIVE_INFINITY);
      }
      if (maxLevel != null) {
        maxLevel = Math.max(maxLevel, currentLevel ?? Number.NEGATIVE_INFINITY);
      }
    }

    applyPatchState(this.state, {
      currentLevel: currentLevel,
      minLevel: minLevel,
      maxLevel: maxLevel,
      onLevel: currentLevel ?? this.state.onLevel,
    });
  }

  override async moveToLevelLogic(level: number) {
    const homeAssistant = this.agent.get(HomeAssistantEntityBehavior);
    const current = this.state.config.getValue(homeAssistant.entity.state);
    if (level === current) {
      return;
    }
    await homeAssistant.callAction(
      this.state.config.moveToLevel.action,
      this.state.config.moveToLevel.data(level),
    );
  }

  private validValue(
    number: number | null | undefined,
  ): number | null | undefined {
    if (number != null && Number.isNaN(number)) {
      return undefined;
    }
    return number;
  }
}

export namespace LevelControlServerBase {
  export class State extends FeaturedBase.State {
    config!: LevelControlConfig;
  }
}

export class LevelControlServer extends LevelControlServerBase.for(
  ClusterType(LevelControl.Base),
) {}
