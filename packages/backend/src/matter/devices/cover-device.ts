import { WindowCoveringDevice } from "@matter/main/devices";
import { BasicInformationServer } from "../behaviors/basic-information-server.js";
import { IdentifyServer } from "../behaviors/identify-server.js";
import { WindowCoveringServer } from "../behaviors/window-covering-server.js";
import { HomeAssistantEntityBehavior } from "../custom-behaviors/home-assistant-entity-behavior.js";
import {
  CoverDeviceAttributes,
  CoverSupportedFeatures,
} from "@home-assistant-matter-hub/common";
import { testBit } from "../../utils/test-bit.js";
import { EndpointType } from "@matter/main";

const CoverDeviceType = (positionAwareLift: boolean) => {
  const windowCoveringServer = positionAwareLift
    ? WindowCoveringServer.with("Lift", "PositionAwareLift")
    : WindowCoveringServer.with("Lift");
  return WindowCoveringDevice.with(
    BasicInformationServer,
    IdentifyServer,
    HomeAssistantEntityBehavior,
    windowCoveringServer,
  );
};

export function CoverDevice(
  homeAssistantEntity: HomeAssistantEntityBehavior.State,
): EndpointType {
  const attributes = homeAssistantEntity.entity.state
    .attributes as CoverDeviceAttributes;
  const supportedFeatures = attributes.supported_features ?? 0;
  const positionAwareLift = testBit(
    supportedFeatures,
    CoverSupportedFeatures.support_set_position,
  );
  return CoverDeviceType(positionAwareLift).set({ homeAssistantEntity });
}
