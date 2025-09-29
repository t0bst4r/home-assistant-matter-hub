import type { EndpointType } from "@matter/main";
import { DoorLock } from "@matter/main/clusters";
import { DoorLockDevice } from "@matter/main/devices";
import { BasicInformationServer } from "../../../behaviors/basic-information-server.js";
import { HomeAssistantEntityBehavior } from "../../../behaviors/home-assistant-entity-behavior.js";
import { IdentifyServer } from "../../../behaviors/identify-server.js";
import {
  LockServer,
  type LockServerConfig,
} from "../../../behaviors/lock-server.js";

const mapHAState: Record<string, DoorLock.LockState> = {
  locked: DoorLock.LockState.Locked,
  locking: DoorLock.LockState.Locked,
  unlocked: DoorLock.LockState.Unlocked,
  unlocking: DoorLock.LockState.Unlocked,
};

const lockServerConfig: LockServerConfig = {
  getLockState: (entity) =>
    mapHAState[entity.state] ?? DoorLock.LockState.NotFullyLocked,
  lock: () => ({ action: "lock.lock" }),
  unlock: () => ({ action: "lock.unlock" }),
};

const LockDeviceType = DoorLockDevice.with(
  BasicInformationServer,
  IdentifyServer,
  HomeAssistantEntityBehavior,
  LockServer(lockServerConfig),
);

export function LockDevice(
  homeAssistantEntity: HomeAssistantEntityBehavior.State,
): EndpointType {
  return LockDeviceType.set({ homeAssistantEntity });
}
