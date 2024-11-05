import { MatterDevice } from "../matter-device.js";
import { DoorLockDevice } from "@project-chip/matter.js/devices/DoorLockDevice";
import { BasicInformationServer } from "../behaviors/basic-information-server.js";
import { IdentifyServer } from "../behaviors/identify-server.js";
import { LockServer } from "../behaviors/lock-server.js";
import { HomeAssistantBehavior } from "../custom-behaviors/home-assistant-behavior.js";

const LockDeviceType = DoorLockDevice.with(
  BasicInformationServer,
  IdentifyServer,
  HomeAssistantBehavior,
  LockServer,
);

export function LockDevice(homeAssistant: HomeAssistantBehavior.State) {
  return new MatterDevice(LockDeviceType, homeAssistant);
}
