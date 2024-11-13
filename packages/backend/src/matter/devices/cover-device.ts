import { MatterDevice } from "../matter-device.js";
import { WindowCoveringDevice } from "@matter/main/devices";
import { BasicInformationServer } from "../behaviors/basic-information-server.js";
import { IdentifyServer } from "../behaviors/identify-server.js";
import { WindowCoveringServer } from "../behaviors/window-covering-server.js";
import { HomeAssistantBehavior } from "../custom-behaviors/home-assistant-behavior.js";

const CoverDeviceType = WindowCoveringDevice.with(
  BasicInformationServer,
  IdentifyServer,
  HomeAssistantBehavior,
  WindowCoveringServer,
);

export function CoverDevice(homeAssistant: HomeAssistantBehavior.State) {
  return new MatterDevice(CoverDeviceType, homeAssistant, {
    windowCovering: {
      configStatus: { liftMovementReversed: true },
    },
  });
}
