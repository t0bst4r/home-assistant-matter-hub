import { DoorLockServer as Base } from "@matter/main/behaviors";
import { HomeAssistantEntityState } from "@home-assistant-matter-hub/common";
import { DoorLock } from "@matter/main/clusters";
import { HomeAssistantBehavior } from "../custom-behaviors/home-assistant-behavior.js";

export class LockServer extends Base {
  override async initialize() {
    await super.initialize();
    const homeAssistant = await this.agent.load(HomeAssistantBehavior);
    Object.assign(this.state, {
      lockState: this.getMatterLockState(homeAssistant.entity),
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
    homeAssistant.onChange.on(this.callback(this.update));
  }

  private async update(state: HomeAssistantEntityState) {
    const newState = this.getMatterLockState(state);
    if (this.state.lockState !== newState) {
      this.state.lockState = newState;
    }
  }

  override async lockDoor() {
    super.lockDoor();
    const homeAssistant = this.agent.get(HomeAssistantBehavior);
    await homeAssistant.callAction("lock", "lock", undefined, {
      entity_id: homeAssistant.entityId,
    });
  }

  override async unlockDoor() {
    super.unlockDoor();
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
