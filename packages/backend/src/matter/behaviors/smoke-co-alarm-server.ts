import { SmokeCoAlarmServer as Base } from "@matter/main/behaviors";
import { HomeAssistantBehavior } from "../custom-behaviors/home-assistant-behavior.js";
import { HomeAssistantEntityState } from "@home-assistant-matter-hub/common";
import { applyPatchState } from "../../utils/apply-patch-state.js";
import { SmokeCoAlarm } from "@matter/main/clusters";

export class SmokeCoAlarmServer extends Base.with("CoAlarm", "SmokeAlarm") {
  override async initialize() {
    await super.initialize();
    const homeAssistant = await this.agent.load(HomeAssistantBehavior);
    this.update(homeAssistant.entity);
    this.reactTo(homeAssistant.onChange, this.update);
  }

  private update(state: HomeAssistantEntityState) {
    applyPatchState(this.state, {
      expressedState: SmokeCoAlarm.ExpressedState.Normal,
      batteryAlert: SmokeCoAlarm.AlarmState.Normal,
      testInProgress: false,
      hardwareFaultAlert: false,
      endOfServiceAlert: SmokeCoAlarm.EndOfService.Normal,
      ...(this.features.coAlarm
        ? {
            smokeState: SmokeCoAlarm.AlarmState.Normal,
          }
        : {}),
      ...(this.features.smokeAlarm
        ? {
            coState: SmokeCoAlarm.AlarmState.Normal,
          }
        : {}),
    });
  }

  private isOccupied(state: HomeAssistantEntityState): boolean {
    return state.state !== "off";
  }
}
