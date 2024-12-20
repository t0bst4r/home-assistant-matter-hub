import { LevelControlServer as Base } from "@matter/main/behaviors";
import {
  HomeAssistantEntityInformation,
  HomeAssistantEntityState,
} from "@home-assistant-matter-hub/common";
import { HomeAssistantEntityBehavior } from "../custom-behaviors/home-assistant-entity-behavior.js";
import { applyPatchState } from "../../utils/apply-patch-state.js";
import { ClusterType } from "@matter/main/types";
import { LevelControl } from "@matter/main/clusters";

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

export class LevelControlServerBase extends Base {
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

    if (this.state.config?.expandMinMaxForValue == true) {
      if (minLevel != null) {
        minLevel = Math.min(minLevel, currentLevel ?? Infinity);
      }
      if (maxLevel != null) {
        maxLevel = Math.max(maxLevel, currentLevel ?? -Infinity);
      }
    }

    applyPatchState(this.state, {
      currentLevel: currentLevel,
      minLevel: minLevel,
      maxLevel: maxLevel,
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
    if (number != null && isNaN(number)) {
      return undefined;
    }
    return number;
  }
}

export namespace LevelControlServerBase {
  export class State extends Base.State {
    config!: LevelControlConfig;
  }
}

export class LevelControlServer extends LevelControlServerBase.for(
  ClusterType(LevelControl.Base),
).with("OnOff") {}
