import type { HomeAssistantEntityInformation } from "@home-assistant-matter-hub/common";
import { RvcOperationalStateServer as Base } from "@matter/main/behaviors/rvc-operational-state";
import { RvcOperationalState } from "@matter/main/clusters/rvc-operational-state";
import { applyPatchState } from "../../utils/apply-patch-state.js";
import { HomeAssistantEntityBehavior } from "../custom-behaviors/home-assistant-entity-behavior.js";
import type { ValueGetter } from "./utils/cluster-config.js";
import OperationalState = RvcOperationalState.OperationalState;
import ErrorState = RvcOperationalState.ErrorState;

export interface RvcOperationalStateServerConfig {
  getOperationalState: ValueGetter<OperationalState>;
}

class RvcOperationalStateServerBase extends Base {
  declare state: RvcOperationalStateServerBase.State;

  override async initialize() {
    await super.initialize();
    const homeAssistant = await this.agent.load(HomeAssistantEntityBehavior);
    this.update(homeAssistant.entity);
    this.reactTo(homeAssistant.onChange, this.update);
  }

  private update(entity: HomeAssistantEntityInformation) {
    const operationalState = this.state.config.getOperationalState(
      entity.state,
      this.agent,
    );

    applyPatchState(this.state, {
      operationalState,
      operationalError: {
        errorStateId:
          operationalState === OperationalState.Error
            ? ErrorState.Stuck
            : ErrorState.NoError,
      },
    });
  }
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
