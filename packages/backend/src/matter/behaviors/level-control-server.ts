import { LevelControlServer as Base } from "@matter/main/behaviors";
import { HomeAssistantEntityState } from "@home-assistant-matter-hub/common";
import { LevelControl } from "@matter/main/clusters";
import { HomeAssistantBehavior } from "../custom-behaviors/home-assistant-behavior.js";

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
    const state = homeAssistant.entity;
    Object.assign(this.state, {
      currentLevel: this.state.config.getValue(state),
      minLevel: this.state.config.getMinValue?.(state),
      maxLevel: this.state.config.getMaxValue?.(state),
    });
    this.reactTo(homeAssistant.onChange, this.update);
  }

  protected async update(state: HomeAssistantEntityState) {
    const level = this.state.config.getValue(state);
    if (level != null && !isNaN(level) && level != this.state.currentLevel) {
      this.state.currentLevel = level;
    }
  }

  override async moveToLevel(request: LevelControl.MoveToLevelRequest) {
    await super.moveToLevel(request);
    await this.handleMoveToLevel(request);
  }

  override async moveToLevelWithOnOff(
    request: LevelControl.MoveToLevelRequest,
  ) {
    await super.moveToLevelWithOnOff(request);
    await this.handleMoveToLevel(request);
  }

  private async handleMoveToLevel(request: LevelControl.MoveToLevelRequest) {
    const homeAssistant = this.agent.get(HomeAssistantBehavior);
    const [domain, action] = this.state.config.moveToLevel.action.split(".");
    await homeAssistant.callAction(
      domain,
      action,
      this.state.config.moveToLevel.data(request.level),
      {
        entity_id: homeAssistant.entityId,
      },
    );
  }
}

export namespace LevelControlServer {
  export class State extends Base.State {
    config!: LevelControlConfig;
  }
}
