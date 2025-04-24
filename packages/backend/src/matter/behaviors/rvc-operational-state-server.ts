import type { HomeAssistantEntityInformation } from "@home-assistant-matter-hub/common";
import { RvcOperationalStateServer as Base } from "@matter/main/behaviors/rvc-operational-state";
import { RvcOperationalState } from "@matter/main/clusters/rvc-operational-state";
import { applyPatchState } from "../../utils/apply-patch-state.js";
import { HomeAssistantEntityBehavior } from "../custom-behaviors/home-assistant-entity-behavior.js";
import type { ValueGetter, ValueSetter } from "./utils/cluster-config.js";
import OperationalState = RvcOperationalState.OperationalState;
import ErrorState = RvcOperationalState.ErrorState;

export interface RvcOperationalStateServerConfig {
  getOperationalState: ValueGetter<OperationalState>;
  pause: ValueSetter<void>;
  resume: ValueSetter<void>;
}

class RvcOperationalStateServerBase extends Base {
  declare state: RvcOperationalStateServerBase.State;

  override async initialize() {
    const homeAssistant = await this.agent.load(HomeAssistantEntityBehavior);
    this.update(homeAssistant.entity);
    this.reactTo(homeAssistant.onChange, this.update);
    await super.initialize();
  }

  private update(entity: HomeAssistantEntityInformation) {
    const operationalState = this.state.config.getOperationalState(
      entity.state,
      this.agent,
    );
    const operationalStateList = Object.values(OperationalState)
      .filter((id): id is number => !Number.isNaN(+id))
      .map((id) => ({
        operationalStateId: id,
      }));

    applyPatchState(this.state, {
      operationalState,
      operationalStateList,
      operationalError: {
        errorStateId:
          operationalState === OperationalState.Error
            ? ErrorState.Stuck
            : ErrorState.NoError,
      },
    });
  }

  override pause =
    async (): Promise<RvcOperationalState.OperationalCommandResponse> => {
      const homeAssistant = this.agent.get(HomeAssistantEntityBehavior);
      await homeAssistant.callAction(
        this.state.config.pause(void 0, this.agent),
      );
      return {
        commandResponseState: {
          errorStateId: ErrorState.NoError,
        },
      };
    };

  override resume =
    async (): Promise<RvcOperationalState.OperationalCommandResponse> => {
      const homeAssistant = this.agent.get(HomeAssistantEntityBehavior);
      await homeAssistant.callAction(
        this.state.config.resume(void 0, this.agent),
      );
      return {
        commandResponseState: {
          errorStateId: ErrorState.NoError,
        },
      };
    };
}

namespace RvcOperationalStateServerBase {
  export class State extends Base.State {
    config!: RvcOperationalStateServerConfig;
  }
}

export function RvcOperationalStateServer(
  config: RvcOperationalStateServerConfig,
) {
  return RvcOperationalStateServerBase.set({ config });
}
