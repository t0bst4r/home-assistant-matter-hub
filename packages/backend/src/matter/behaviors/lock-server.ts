import type { HomeAssistantEntityInformation } from "@home-assistant-matter-hub/common";
import { DoorLockServer as Base } from "@matter/main/behaviors";
import { DoorLock } from "@matter/main/clusters";
import { applyPatchState } from "../../utils/apply-patch-state.js";
import { HomeAssistantEntityBehavior } from "../custom-behaviors/home-assistant-entity-behavior.js";
import type { ValueGetter, ValueSetter } from "./utils/cluster-config.js";
import LockState = DoorLock.LockState;

export interface LockServerConfig {
  getLockState: ValueGetter<LockState>;
  lock: ValueSetter<void>;
  unlock: ValueSetter<void>;
}

class LockServerBase extends Base {
  declare state: LockServerBase.State;

  override async initialize() {
    await super.initialize();
    const homeAssistant = await this.agent.load(HomeAssistantEntityBehavior);
    this.update(homeAssistant.entity);
    this.reactTo(homeAssistant.onChange, this.update);
  }

  private update(entity: HomeAssistantEntityInformation) {
    applyPatchState(this.state, {
      lockState: this.state.config.getLockState(entity.state, this.agent),
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
    await homeAssistant.callAction(this.state.config.lock(void 0, this.agent));
  }

  override async unlockDoor() {
    const homeAssistant = this.agent.get(HomeAssistantEntityBehavior);
    await homeAssistant.callAction(
      this.state.config.unlock(void 0, this.agent),
    );
  }
}

namespace LockServerBase {
  export class State extends Base.State {
    config!: LockServerConfig;
  }
}

export function LockServer(config: LockServerConfig) {
  return LockServerBase.set({ config });
}
