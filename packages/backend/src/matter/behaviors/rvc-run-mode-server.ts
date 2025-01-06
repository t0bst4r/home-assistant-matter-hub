import { RvcRunModeServer as Base } from "@matter/main/behaviors/rvc-run-mode";
import { HomeAssistantEntityBehavior } from "../custom-behaviors/home-assistant-entity-behavior.js";
import {
  HomeAssistantEntityInformation,
  VacuumDeviceState,
} from "@home-assistant-matter-hub/common";
import { applyPatchState } from "../../utils/apply-patch-state.js";
import { RvcRunMode } from "@matter/main/clusters/rvc-run-mode";

const FeaturedBase = Base.with("OnOff");

export class RvcRunModeServer extends FeaturedBase {
  override async initialize() {
    await super.initialize();
    const homeAssistant = await this.agent.load(HomeAssistantEntityBehavior);
    this.update(homeAssistant.entity);
    this.reactTo(homeAssistant.onChange, this.update);
  }

  private update(entity: HomeAssistantEntityInformation) {
    const state = entity.state.state as VacuumDeviceState;
    applyPatchState(this.state, {
      supportedModes: [
        {
          label: "Idle",
          mode: 0,
          modeTags: [{ value: RvcRunMode.ModeTag.Idle }],
        },
        {
          label: "Cleaning",
          mode: 1,
          modeTags: [{ value: RvcRunMode.ModeTag.Cleaning }],
        },
      ],
      currentMode: [VacuumDeviceState.Cleaning].includes(state) ? 1 : 0,
    });
  }
}
