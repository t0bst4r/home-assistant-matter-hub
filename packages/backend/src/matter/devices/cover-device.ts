import { MatterDevice } from "../matter-device.js";
import { WindowCoveringDevice } from "@matter/main/devices";
import { BasicInformationServer } from "../behaviors/basic-information-server.js";
import { IdentifyServer } from "../behaviors/identify-server.js";
import { WindowCoveringServer } from "../behaviors/window-covering-server.js";
import { HomeAssistantBehavior } from "../custom-behaviors/home-assistant-behavior.js";
import {
  CoverDeviceAttributes,
  CoverSupportedFeatures,
} from "@home-assistant-matter-hub/common";
import { testBit } from "../../utils/test-bit.js";

const CoverDeviceType = (positionAwareLift: boolean) => {
  const windowCoveringServer = positionAwareLift
    ? WindowCoveringServer.with("Lift", "PositionAwareLift")
    : WindowCoveringServer.with("Lift");
  return WindowCoveringDevice.with(
    BasicInformationServer,
    IdentifyServer,
    HomeAssistantBehavior,
    windowCoveringServer,
  );
};

export function CoverDevice(homeAssistant: HomeAssistantBehavior.State) {
  const attributes = homeAssistant.entity.attributes as CoverDeviceAttributes;
  const supportedFeatures = attributes.supported_features ?? 0;
  const positionAwareLift = testBit(
    supportedFeatures,
    CoverSupportedFeatures.support_set_position,
  );
  return new MatterDevice(CoverDeviceType(positionAwareLift), homeAssistant, {
    windowCovering: {
      configStatus: { liftMovementReversed: true },
    },
  });
}
