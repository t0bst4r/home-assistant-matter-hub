import type { EndpointType } from "@matter/main";
import { DoorLockDevice } from "@matter/main/devices";
import { BasicInformationServer } from "../behaviors/basic-information-server.js";
import { IdentifyServer } from "../behaviors/identify-server.js";
import { LockServer } from "../behaviors/lock-server.js";
import { HomeAssistantEntityBehavior } from "../custom-behaviors/home-assistant-entity-behavior.js";

const LockDeviceType = DoorLockDevice.with(
  BasicInformationServer,
  IdentifyServer,
  HomeAssistantEntityBehavior,
  LockServer,
);

export function LockDevice(
  homeAssistantEntity: HomeAssistantEntityBehavior.State,
): EndpointType {
  return LockDeviceType.set({ homeAssistantEntity });
}
