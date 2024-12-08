import { LevelControlServer as Base } from "@matter/main/behaviors";
import {
  HomeAssistantEntityInformation,
  HomeAssistantEntityState,
} from "@home-assistant-matter-hub/common";
import { HomeAssistantEntityBehavior } from "../custom-behaviors/home-assistant-entity-behavior.js";
import { applyPatchState } from "../../utils/apply-patch-state.js";

export interface LevelControlConfig {
  getValue: (state: HomeAssistantEntityState) => number | null;
  getMinValue?: (state: HomeAssistantEntityState) => number | undefined;
  getMaxValue?: (state: HomeAssistantEntityState) => number | undefined;
  moveToLevel: {
    action: string;
    data: (value: number) => object;
  };
}

export class LevelControlServer extends Base {
  declare state: LevelControlServer.State;

  override async initialize() {
    super.initialize();
    const homeAssistant = await this.agent.load(HomeAssistantEntityBehavior);
    this.update(homeAssistant.entity);
    this.reactTo(homeAssistant.onChange, this.update);
  }

  private update({ state }: HomeAssistantEntityInformation) {
    applyPatchState(this.state, {
      currentLevel:
        this.validValue(this.state.config.getValue(state)) ??
        this.state.currentLevel,
      minLevel:
        this.validValue(this.state.config.getMinValue?.(state)) ?? undefined,
      maxLevel:
        this.validValue(this.state.config.getMaxValue?.(state)) ?? undefined,
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

export namespace LevelControlServer {
  export class State extends Base.State {
    config!: LevelControlConfig;
  }
}
