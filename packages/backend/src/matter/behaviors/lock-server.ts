import { DoorLockServer as Base } from "@matter/main/behaviors";
import {
  HomeAssistantEntityInformation,
  HomeAssistantEntityState,
} from "@home-assistant-matter-hub/common";
import { DoorLock } from "@matter/main/clusters";
import { HomeAssistantEntityBehavior } from "../custom-behaviors/home-assistant-entity-behavior.js";
import { applyPatchState } from "../../utils/apply-patch-state.js";

export class LockServer extends Base {
  override async initialize() {
    await super.initialize();
    const homeAssistant = await this.agent.load(HomeAssistantEntityBehavior);
    this.update(homeAssistant.entity);
    this.reactTo(homeAssistant.onChange, this.update);
  }

  private update(entity: HomeAssistantEntityInformation) {
    applyPatchState(this.state, {
      lockState: this.getMatterLockState(entity.state),
      lockType: DoorLock.LockType.DeadBolt,
      operatingMode: DoorLock.OperatingMode.Normal,
      actuatorEnabled: true,
      supportedOperatingModes: {
        noRemoteLockUnlock: false,
        normal: true,
        passage: false,
        privacy: false,
        vacation: false,
      },
    });
  }

  override async lockDoor() {
    const homeAssistant = this.agent.get(HomeAssistantEntityBehavior);
    await homeAssistant.callAction("lock.lock");
  }

  override async unlockDoor() {
    const homeAssistant = this.agent.get(HomeAssistantEntityBehavior);
    await homeAssistant.callAction("lock.unlock");
  }

  private getMatterLockState(state: HomeAssistantEntityState) {
    return mapHAState[state.state] ?? DoorLock.LockState.NotFullyLocked;
  }
}

const mapHAState: Record<string, DoorLock.LockState> = {
  locked: DoorLock.LockState.Locked,
  locking: DoorLock.LockState.Locked,
  unlocked: DoorLock.LockState.Unlocked,
  unlocking: DoorLock.LockState.Unlocked,
};
