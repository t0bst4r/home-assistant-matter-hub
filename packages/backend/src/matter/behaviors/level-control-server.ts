import { LevelControlServer as Base } from "@project-chip/matter.js/behaviors/level-control";
import { HomeAssistantEntityState } from "@home-assistant-matter-hub/common";
import { haMixin } from "../mixins/ha-mixin.js";
import { LevelControl } from "@project-chip/matter.js/cluster";
import { Behavior } from "@project-chip/matter.js/behavior";

export interface LevelControlConfig {
  getValue: (state: HomeAssistantEntityState) => number | null | undefined;
  getMinValue?: (state: HomeAssistantEntityState) => number | undefined;
  getMaxValue?: (state: HomeAssistantEntityState) => number | undefined;
  moveToLevel: {
    action: string;
    data: (value: number) => object;
  };
}

export function LevelControlServer(config: LevelControlConfig) {
  return class ThisType extends haMixin("LevelControl", Base) {
    override initialize() {
      super.initialize();
      this.endpoint.entityState.subscribe(this.update.bind(this));
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
      const [domain, action] = config.moveToLevel.action.split(".");
      await this.callAction(
        domain,
        action,
        config.moveToLevel.data(request.level),
        {
          entity_id: this.entity.entity_id,
        },
      );
    }
  };
}

export namespace LevelControlServer {
  export function createState(
    config: LevelControlConfig,
    state: HomeAssistantEntityState,
  ): Behavior.Options<typeof Base> {
    return {
      currentLevel: config.getValue(state),
      minLevel: config.getMinValue?.(state),
      maxLevel: config.getMaxValue?.(state),
    };
  }
}
