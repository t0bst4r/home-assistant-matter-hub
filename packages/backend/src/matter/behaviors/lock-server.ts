import { haMixin } from "../mixins/ha-mixin.js";
import { DoorLockServer } from "@project-chip/matter.js/behavior/definitions/door-lock";
import { HomeAssistantEntityState } from "@home-assistant-matter-hub/common";
import { Behavior } from "@project-chip/matter.js/behavior";
import { DoorLock } from "@project-chip/matter.js/cluster";

export class LockServer extends haMixin("LockServer", DoorLockServer) {
  override initialize() {
    super.initialize();
    this.endpoint.entityState.subscribe(this.update.bind(this));
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
    await this.callAction("lock", "lock", undefined, {
      entity_id: this.entity.entity_id,
    });
  }

  override async unlockDoor() {
    super.unlockDoor();
    await this.callAction("lock", "unlock", undefined, {
      entity_id: this.entity.entity_id,
    });
  }
}

export namespace LockServer {
  export function createState(
    state: HomeAssistantEntityState,
  ): Behavior.Options<typeof LockServer> {
    return {
      lockState: getMatterLockState(state),
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
    };
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
