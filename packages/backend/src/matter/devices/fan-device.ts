import { FanDevice as Device } from "@matter/main/devices";
import { OnOffConfig, OnOffServer } from "../behaviors/on-off-server.js";
import { BasicInformationServer } from "../behaviors/basic-information-server.js";
import { IdentifyServer } from "../behaviors/identify-server.js";
import { FanControlServer } from "../behaviors/fan-control-server.js";
import {
  FanDeviceAttributes,
  FanDeviceFeature,
} from "@home-assistant-matter-hub/common";
import { HomeAssistantEntityBehavior } from "../custom-behaviors/home-assistant-entity-behavior.js";
import { EndpointType } from "@matter/main";
import { FanControl } from "@matter/main/clusters";
import { FeatureSelection } from "../../utils/feature-selection.js";
import { testBit } from "../../utils/test-bit.js";

const fanOnOffConfig: OnOffConfig = {
  turnOn: { action: "fan.turn_on" },
  turnOff: { action: "fan.turn_off" },
};

const FanControlFeatures = (supportedFeatures: number) => {
  const features: FeatureSelection<FanControl.Cluster> = new Set();
  if (testBit(supportedFeatures, FanDeviceFeature.SET_SPEED)) {
    features.add("MultiSpeed");
    features.add("Step");
  }
  if (testBit(supportedFeatures, FanDeviceFeature.PRESET_MODE)) {
    features.add("Auto");
  }
  if (testBit(supportedFeatures, FanDeviceFeature.DIRECTION)) {
    features.add("AirflowDirection");
  }
  return features;
};

export function FanDevice(
  homeAssistantEntity: HomeAssistantEntityBehavior.State,
): EndpointType {
  const attributes = homeAssistantEntity.entity.state
    .attributes as FanDeviceAttributes;
  const supportedFeatures = attributes.supported_features ?? 0;
  const device = Device.with(
    IdentifyServer,
    BasicInformationServer,
    HomeAssistantEntityBehavior,
    OnOffServer.set({ config: fanOnOffConfig }),
    FanControlServer.with(...FanControlFeatures(supportedFeatures)),
  );
  return device.set({ homeAssistantEntity });
}
