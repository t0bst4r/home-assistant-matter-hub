import {
  type FanDeviceAttributes,
  FanDeviceFeature,
} from "@home-assistant-matter-hub/common";
import type { EndpointType } from "@matter/main";
import type { FanControl } from "@matter/main/clusters";
import { FanDevice as Device } from "@matter/main/devices";
import type { FeatureSelection } from "../../../../utils/feature-selection.js";
import { testBit } from "../../../../utils/test-bit.js";
import { BasicInformationServer } from "../../../behaviors/basic-information-server.js";
import { HomeAssistantEntityBehavior } from "../../../behaviors/home-assistant-entity-behavior.js";
import { IdentifyServer } from "../../../behaviors/identify-server.js";
import { FanFanControlServer } from "./behaviors/fan-fan-control-server.js";
import { FanOnOffServer } from "./behaviors/fan-on-off-server.js";

export function FanDevice(
  homeAssistantEntity: HomeAssistantEntityBehavior.State,
): EndpointType {
  const attributes = homeAssistantEntity.entity.state
    .attributes as FanDeviceAttributes;
  const supportedFeatures = attributes.supported_features ?? 0;

  const features: FeatureSelection<FanControl.Cluster> = new Set();
  if (testBit(supportedFeatures, FanDeviceFeature.SET_SPEED)) {
    features.add("MultiSpeed");
  }
  if (testBit(supportedFeatures, FanDeviceFeature.SET_SPEED)) {
    features.add("Step");
  }
  if (testBit(supportedFeatures, FanDeviceFeature.PRESET_MODE)) {
    features.add("Auto");
  }
  if (testBit(supportedFeatures, FanDeviceFeature.DIRECTION)) {
    features.add("AirflowDirection");
  }

  const device = Device.with(
    IdentifyServer,
    BasicInformationServer,
    HomeAssistantEntityBehavior,
    FanOnOffServer,
    FanFanControlServer.with(...features),
  );
  return device.set({ homeAssistantEntity });
}
