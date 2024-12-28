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
import { FeatureSelection } from "../../utils/feature-selection.js";
import { WindowCovering } from "@matter/main/clusters";

const CoverDeviceType = (supportedFeatures: number) => {
  const features: FeatureSelection<WindowCovering.Complete> = new Set();
  if (testBit(supportedFeatures, CoverSupportedFeatures.support_open)) {
    features.add("Lift");
    features.add("PositionAwareLift");
    if (
      testBit(supportedFeatures, CoverSupportedFeatures.support_set_position)
    ) {
      features.add("AbsolutePosition");
    }
  }

  if (testBit(supportedFeatures, CoverSupportedFeatures.support_open_tilt)) {
    features.add("Tilt");
    features.add("PositionAwareTilt");
    if (
      testBit(
        supportedFeatures,
        CoverSupportedFeatures.support_set_tilt_position,
      )
    ) {
      features.add("AbsolutePosition");
    }
  }

  return WindowCoveringDevice.with(
    BasicInformationServer,
    IdentifyServer,
    HomeAssistantEntityBehavior,
    WindowCoveringServer.with(...features),
  );
};

export function CoverDevice(
  homeAssistantEntity: HomeAssistantEntityBehavior.State,
): EndpointType {
  const attributes = homeAssistantEntity.entity.state
    .attributes as CoverDeviceAttributes;
  return CoverDeviceType(attributes.supported_features ?? 0).set({
    homeAssistantEntity,
  });
}
