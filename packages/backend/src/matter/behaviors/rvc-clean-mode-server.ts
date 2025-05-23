import {
  type HomeAssistantEntityInformation,
  VacuumFanSpeed,
} from "@home-assistant-matter-hub/common";
import { MaybePromise } from "@matter/general";
import { RvcCleanModeServer as Base } from "@matter/main/behaviors";
import { ModeBase, type RvcCleanMode } from "@matter/main/clusters";
import { applyPatchState } from "../../utils/apply-patch-state.js";
import { HomeAssistantEntityBehavior } from "../custom-behaviors/home-assistant-entity-behavior.js";
import type { ValueGetter, ValueSetter } from "./utils/cluster-config.js";

export enum RvcSupportedCleanMode {
  Quiet = 0,
  Normal = 1,
  Turbo = 2,
  Max = 3,
}

export interface RvcCleanModeServerConfig {
  getCurrentMode: ValueGetter<RvcSupportedCleanMode>;
  getSupportedModes: ValueGetter<RvcCleanMode.ModeOption[]>;

  changeFanSpeed: ValueSetter<string>;
}

class RvcCleanModeServerBase extends Base {
  declare state: RvcCleanModeServerBase.State;

  override async initialize() {
    const homeAssistant = await this.agent.load(HomeAssistantEntityBehavior);
    this.update(homeAssistant.entity);
    this.reactTo(homeAssistant.onChange, this.update);
    await super.initialize();
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

  override async changeToMode({
    newMode,
  }: ModeBase.ChangeToModeRequest): Promise<ModeBase.ChangeToModeResponse> {
    const homeAssistant = this.agent.get(HomeAssistantEntityBehavior);
    switch (newMode) {
      case RvcSupportedCleanMode.Quiet:
        await homeAssistant.callAction(
          this.state.config.changeFanSpeed("Quiet", this.agent),
        );
        break;
      case RvcSupportedCleanMode.Normal:
        await homeAssistant.callAction(
          this.state.config.changeFanSpeed("Standard", this.agent),
        );
        break;
      case RvcSupportedCleanMode.Turbo:
        await homeAssistant.callAction(
          this.state.config.changeFanSpeed("Turbo", this.agent),
        );
        break;
      case RvcSupportedCleanMode.Max:
        await homeAssistant.callAction(
          this.state.config.changeFanSpeed("Max", this.agent),
        );
        break;
      default:
        await homeAssistant.callAction(
          this.state.config.changeFanSpeed("Standard", this.agent),
        );
        break;
    }

    return {
      status: ModeBase.ModeChangeStatus.Success,
      statusText: "Successfully switched mode",
    };
  }
}

namespace RvcCleanModeServerBase {
  export class State extends Base.State {
    config!: RvcCleanModeServerConfig;
  }
}

export function RvcCleanModeServer(config: RvcCleanModeServerConfig) {
  return RvcCleanModeServerBase.set({ config });
}
