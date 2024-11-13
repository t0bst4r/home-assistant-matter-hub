import { LevelControlServer as Base } from "@matter/main/behaviors";
import { HomeAssistantEntityState } from "@home-assistant-matter-hub/common";
import { HomeAssistantBehavior } from "../custom-behaviors/home-assistant-behavior.js";
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
    const homeAssistant = await this.agent.load(HomeAssistantBehavior);
    this.update(homeAssistant.entity);
    this.reactTo(homeAssistant.onChange, this.update);
  }

  private update(state: HomeAssistantEntityState) {
    applyPatchState(this.state, {
      currentLevel: this.validValue(this.state.config.getValue(state)) ?? null,
      minLevel:
        this.validValue(this.state.config.getMinValue?.(state)) ?? undefined,
      maxLevel:
        this.validValue(this.state.config.getMaxValue?.(state)) ?? undefined,
    });
  }

  override async moveToLevelLogic(level: number) {
    const homeAssistant = this.agent.get(HomeAssistantBehavior);
    const current = this.state.config.getValue(homeAssistant.entity);
    if (level === current) {
      return;
    }
    const [domain, action] = this.state.config.moveToLevel.action.split(".");
    await homeAssistant.callAction(
      domain,
      action,
      this.state.config.moveToLevel.data(level),
      {
        entity_id: homeAssistant.entityId,
      },
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
