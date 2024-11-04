import { LevelControlServer as Base } from "@project-chip/matter.js/behaviors/level-control";
import { HomeAssistantEntityState } from "@home-assistant-matter-hub/common";
import { LevelControl } from "@project-chip/matter.js/cluster";
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

export function LevelControlServer(config: LevelControlConfig) {
  return class ThisType extends Base {
    override async initialize() {
      super.initialize();
      const homeAssistant = await this.agent.load(HomeAssistantBehavior);
      const state = homeAssistant.state.entity;
      this.state.currentLevel = config.getValue(state);
      this.state.minLevel = config.getMinValue?.(state);
      this.state.maxLevel = config.getMaxValue?.(state);
      this.state.managedTransitionTimeHandling = false;
      this.state.onTransitionTime = 1;
      this.state.offTransitionTime = 1;
      this.state.onOffTransitionTime = 1;
      homeAssistant.onUpdate((s) => this.update(s));
    }

    protected async update(state: HomeAssistantEntityState) {
      const current = this.endpoint.stateOf(ThisType);
      const level = config.getValue(state);
      if (level != null && !isNaN(level) && level != current.currentLevel) {
        await this.endpoint.setStateOf(ThisType, {
          currentLevel: level,
        });
      }
    }

    override async moveToLevel(request: LevelControl.MoveToLevelRequest) {
      await super.moveToLevel({
        ...request,
        transitionTime: request.transitionTime ?? 1,
      });
      await this.handleMoveToLevel(request);
    }

    override async moveToLevelWithOnOff(
      request: LevelControl.MoveToLevelRequest,
    ) {
      await super.moveToLevelWithOnOff({
        ...request,
        transitionTime: request.transitionTime ?? 1,
      });
      await this.handleMoveToLevel(request);
    }

    private async handleMoveToLevel(request: LevelControl.MoveToLevelRequest) {
      const homeAssistant = this.agent.get(HomeAssistantBehavior);
      const [domain, action] = config.moveToLevel.action.split(".");
      await homeAssistant.callAction(
        domain,
        action,
        config.moveToLevel.data(request.level),
        {
          entity_id: homeAssistant.state.entity.entity_id,
        },
      );
    }
  };
}
