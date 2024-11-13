import { DoorLockServer as Base } from "@matter/main/behaviors";
import { HomeAssistantEntityState } from "@home-assistant-matter-hub/common";
import { DoorLock } from "@matter/main/clusters";
import { HomeAssistantBehavior } from "../custom-behaviors/home-assistant-behavior.js";
import { applyPatchState } from "../../utils/apply-patch-state.js";

export class LockServer extends Base {
  override async initialize() {
    await super.initialize();
    const homeAssistant = await this.agent.load(HomeAssistantBehavior);
    this.update(homeAssistant.entity);
    this.reactTo(homeAssistant.onChange, this.update);
  }

  private update(entity: HomeAssistantEntityState) {
    applyPatchState(this.state, {
      lockState: this.getMatterLockState(entity),
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
    const homeAssistant = this.agent.get(HomeAssistantBehavior);
    await homeAssistant.callAction("lock", "lock", undefined, {
      entity_id: homeAssistant.entityId,
    });
  }

  override async unlockDoor() {
    const homeAssistant = this.agent.get(HomeAssistantBehavior);
    await homeAssistant.callAction("lock", "unlock", undefined, {
      entity_id: homeAssistant.entityId,
    });
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
