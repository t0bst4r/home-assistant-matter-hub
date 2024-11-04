import { DoorLockServer as Base } from "@project-chip/matter.js/behaviors/door-lock";
import { HomeAssistantEntityState } from "@home-assistant-matter-hub/common";
import { DoorLock } from "@project-chip/matter.js/cluster";
import { HomeAssistantBehavior } from "../custom-behaviors/home-assistant-behavior.js";

export class LockServer extends Base {
  override async initialize() {
    await super.initialize();
    const homeAssistant = await this.agent.load(HomeAssistantBehavior);
    this.state.lockState = getMatterLockState(homeAssistant.state.entity);
    this.state.lockType = DoorLock.LockType.DeadBolt;
    this.state.operatingMode = DoorLock.OperatingMode.Normal;
    this.state.actuatorEnabled = true;
    this.state.supportedOperatingModes = {
      noRemoteLockUnlock: false,
      normal: true,
      passage: false,
      privacy: false,
      vacation: false,
    };
    homeAssistant.onUpdate((s) => this.update(s));
  }

  private async update(state: HomeAssistantEntityState) {
    const current = this.endpoint.stateOf(LockServer);
    const newState = getMatterLockState(state);
    if (current.lockState !== newState) {
      await this.endpoint.setStateOf(LockServer, {
        lockState: newState,
      });
    }
  }

  override async lockDoor() {
    super.lockDoor();
    const homeAssistant = this.agent.get(HomeAssistantBehavior);
    await homeAssistant.callAction("lock", "lock", undefined, {
      entity_id: homeAssistant.state.entity.entity_id,
    });
  }

  override async unlockDoor() {
    super.unlockDoor();
    const homeAssistant = this.agent.get(HomeAssistantBehavior);
    await homeAssistant.callAction("lock", "unlock", undefined, {
      entity_id: homeAssistant.state.entity.entity_id,
    });
  }
}

function getMatterLockState(state: HomeAssistantEntityState) {
  return mapHAState[state.state] ?? DoorLock.LockState.NotFullyLocked;
}

const mapHAState: Record<string, DoorLock.LockState> = {
  locked: DoorLock.LockState.Locked,
  locking: DoorLock.LockState.Locked,
  unlocked: DoorLock.LockState.Unlocked,
  unlocking: DoorLock.LockState.Unlocked,
};
