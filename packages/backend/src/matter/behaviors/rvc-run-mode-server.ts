import {
  type HomeAssistantEntityInformation,
  VacuumState,
} from "@home-assistant-matter-hub/common";
import { RvcRunModeServer as Base } from "@matter/main/behaviors";
import type { ModeBase } from "@matter/main/clusters/mode-base";
import { RvcRunMode } from "@matter/main/clusters/rvc-run-mode";
import { ClusterType, Status } from "@matter/main/types";
import { applyPatchState } from "../../utils/apply-patch-state.js";
import { HomeAssistantEntityBehavior } from "../custom-behaviors/home-assistant-entity-behavior.js";

export enum RvcSupportedRunMode {
  Idle = 0,
  Cleaning = 1,
}

export class RvcRunModeServerBase extends Base {
  override async initialize() {
    await super.initialize();
    const homeAssistant = await this.agent.load(HomeAssistantEntityBehavior);
    this.update(homeAssistant.entity);
    this.reactTo(homeAssistant.onChange, this.update);
  }

  private update(entity: HomeAssistantEntityInformation) {
    applyPatchState(this.state, {
      currentMode: [VacuumState.cleaning].includes(
        entity.state.state as VacuumState,
      )
        ? 1
        : 0,
      supportedModes: [
        {
          label: "Idle",
          mode: RvcSupportedRunMode.Idle,
          modeTags: [{ value: RvcRunMode.ModeTag.Idle }],
        },
        {
          label: "Cleaning",
          mode: RvcSupportedRunMode.Cleaning,
          modeTags: [{ value: RvcRunMode.ModeTag.Cleaning }],
        },
      ],
    });
  }

  override changeToMode = async (
    request: ModeBase.ChangeToModeRequest,
  ): Promise<ModeBase.ChangeToModeResponse> => {
    const homeAssistant = this.agent.get(HomeAssistantEntityBehavior);
    switch (request.newMode) {
      case RvcSupportedRunMode.Cleaning:
        await homeAssistant.callAction("vacuum.start");
        break;
      case RvcSupportedRunMode.Idle:
        await homeAssistant.callAction("vacuum.return_to_base");
        break;
      default:
        await homeAssistant.callAction("vacuum.pause");
        break;
    }
    return { status: Status.Success, statusText: "Successfully switched mode" };
  };
}

export class RvcRunModeServer extends RvcRunModeServerBase.for(
  ClusterType(RvcRunMode.Base),
) {}
