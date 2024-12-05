import {
  FanDevice as Device,
  OnOffPlugInUnitDevice,
} from "@matter/main/devices";
import { OnOffConfig, OnOffServer } from "../behaviors/on-off-server.js";
import { BasicInformationServer } from "../behaviors/basic-information-server.js";
import { IdentifyServer } from "../behaviors/identify-server.js";
import { FanControlServer } from "../behaviors/fan-control-server.js";
import {
  BridgeFeatureFlags,
  FanDeviceAttributes,
  FanDeviceFeature,
  HomeAssistantEntityInformation,
  HomeAssistantEntityState,
} from "@home-assistant-matter-hub/common";
import { HomeAssistantEntityBehavior } from "../custom-behaviors/home-assistant-entity-behavior.js";
import { EndpointType } from "@matter/main";
import {
  LevelControlConfig,
  LevelControlServer,
} from "../behaviors/level-control-server.js";

const fanOnOffConfig: OnOffConfig = {
  turnOn: { action: "fan.turn_on" },
  turnOff: { action: "fan.turn_off" },
};

const PlugInUnitDeviceType = () => {
  const fanLevelConfig: LevelControlConfig = {
    getValue: (state: HomeAssistantEntityState<FanDeviceAttributes>) => {
      if (state.attributes.percentage != null) {
        return (state.attributes.percentage / 100) * 254;
      }
      return 0;
    },
    getMinValue: () => 0,
    getMaxValue: () => 254,
    moveToLevel: {
      action: "fan.set_percentage",
      data: (value) => ({ percentage: (value / 254) * 100 }),
    },
  };
  return OnOffPlugInUnitDevice.with(
    IdentifyServer,
    BasicInformationServer,
    OnOffServer,
    HomeAssistantEntityBehavior,
    LevelControlServer.set({ config: fanLevelConfig }),
  );
};

const FanDeviceType = (entity: HomeAssistantEntityInformation) => {
  const attributes = entity.state.attributes as FanDeviceAttributes;
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
  return Device.with(
    IdentifyServer,
    BasicInformationServer,
    OnOffServer.set({ config: fanOnOffConfig }),
    HomeAssistantEntityBehavior,
    FanControlServer.with(...features),
  );
};

export function FanDevice(
  homeAssistantEntity: HomeAssistantEntityBehavior.State,
  featureFlags?: BridgeFeatureFlags,
): EndpointType {
  const deviceType = featureFlags?.matterFans
    ? FanDeviceType(homeAssistantEntity.entity)
    : PlugInUnitDeviceType();
  return deviceType.set({ homeAssistantEntity });
}
