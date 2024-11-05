import { MatterDevice } from "../matter-device.js";
import { WindowCoveringDevice } from "@project-chip/matter.js/devices/WindowCoveringDevice";
import { BasicInformationServer } from "../behaviors/basic-information-server.js";
import { IdentifyServer } from "../behaviors/identify-server.js";
import {
  WindowCoveringServer,
  WindowCoveringServerConfig,
} from "../behaviors/window-covering-server.js";
import { HomeAssistantBehavior } from "../custom-behaviors/home-assistant-behavior.js";

const CoverDeviceType = WindowCoveringDevice.with(
  BasicInformationServer,
  IdentifyServer,
  HomeAssistantBehavior,
);

export interface CoverDeviceConfig extends WindowCoveringServerConfig {}

export function CoverDevice(homeAssistant: HomeAssistantBehavior.State) {
  const type = CoverDeviceType.with(WindowCoveringServer());
  return new MatterDevice(type, homeAssistant);
}
