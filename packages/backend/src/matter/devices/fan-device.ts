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

const fanOnOffConfig: OnOffConfig = {
  turnOn: { action: "fan.turn_on" },
  turnOff: { action: "fan.turn_off" },
};

export function FanDevice(
  homeAssistantEntity: HomeAssistantEntityBehavior.State,
): EndpointType {
  const attributes = homeAssistantEntity.entity.state
    .attributes as FanDeviceAttributes;
  const presetModes: string[] = attributes.preset_modes ?? [];
  const supportedFeatures = attributes.supported_features ?? 0;

  const features: ("Auto" | "AirflowDirection" | "MultiSpeed")[] = [
    "MultiSpeed",
  ];
  if (
    supportedFeatures & FanDeviceFeature.PRESET_MODE &&
    presetModes.indexOf("Auto") != -1
  ) {
    features.push("Auto");
  }
  if (supportedFeatures & FanDeviceFeature.DIRECTION) {
    features.push("AirflowDirection");
  }
  const deviceType = Device.with(
    IdentifyServer,
    BasicInformationServer,
    OnOffServer.set({ config: fanOnOffConfig }),
    HomeAssistantEntityBehavior,
    FanControlServer.with(...features),
  );

  return deviceType.set({ homeAssistantEntity });
}
