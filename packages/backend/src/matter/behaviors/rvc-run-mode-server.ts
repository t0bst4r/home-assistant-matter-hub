import type { HomeAssistantEntityInformation } from "@home-assistant-matter-hub/common";
import { RvcRunModeServer as Base } from "@matter/main/behaviors";
import { ModeBase } from "@matter/main/clusters/mode-base";
import type { RvcRunMode } from "@matter/main/clusters/rvc-run-mode";
import { applyPatchState } from "../../utils/apply-patch-state.js";
import { HomeAssistantEntityBehavior } from "../custom-behaviors/home-assistant-entity-behavior.js";
import type { ValueGetter, ValueSetter } from "./utils/cluster-config.js";

export enum RvcSupportedRunMode {
  Idle = 0,
  Cleaning = 1,
}

export interface RvcRunModeServerConfig {
  getCurrentMode: ValueGetter<RvcSupportedRunMode>;
  getSupportedModes: ValueGetter<RvcRunMode.ModeOption[]>;

  start: ValueSetter<void>;
  returnToBase: ValueSetter<void>;
  pause: ValueSetter<void>;
}

class RvcRunModeServerBase extends Base {
  declare state: RvcRunModeServerBase.State;

  override async initialize() {
    await super.initialize();
    const homeAssistant = await this.agent.load(HomeAssistantEntityBehavior);
    this.update(homeAssistant.entity);
    this.reactTo(homeAssistant.onChange, this.update);
  }

  private update(entity: HomeAssistantEntityInformation) {
    applyPatchState(this.state, {
      currentMode: this.state.config.getCurrentMode(entity.state, this.agent),
      supportedModes: this.state.config.getSupportedModes(
        entity.state,
        this.agent,
      ),
    });
  }

  override changeToMode = async (
    request: ModeBase.ChangeToModeRequest,
  ): Promise<ModeBase.ChangeToModeResponse> => {
    const homeAssistant = this.agent.get(HomeAssistantEntityBehavior);
    switch (request.newMode) {
      case RvcSupportedRunMode.Cleaning:
        await homeAssistant.callAction(
          this.state.config.start(void 0, this.agent),
        );
        break;
      case RvcSupportedRunMode.Idle:
        await homeAssistant.callAction(
          this.state.config.returnToBase(void 0, this.agent),
        );
        break;
      default:
        await homeAssistant.callAction(
          this.state.config.pause(void 0, this.agent),
        );
        break;
    }
    return {
      status: ModeBase.ModeChangeStatus.Success,
      statusText: "Successfully switched mode",
    };
  };
}

namespace RvcRunModeServerBase {
  export class State extends Base.State {
    config!: RvcRunModeServerConfig;
  }
}

export function RvcRunModeServer(config: RvcRunModeServerConfig) {
  return RvcRunModeServerBase.set({ config });
}
