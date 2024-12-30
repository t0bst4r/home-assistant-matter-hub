import {
  BridgeFeatureFlags,
  HomeAssistantEntityState,
  MediaPlayerDeviceAttributes,
} from "@home-assistant-matter-hub/common";
import { SpeakerDevice } from "@matter/main/devices";
import { BasicInformationServer } from "../behaviors/basic-information-server.js";
import { IdentifyServer } from "../behaviors/identify-server.js";
import { OnOffServer, OnOffConfig } from "../behaviors/on-off-server.js";
import {
  LevelControlConfig,
  LevelControlServer,
} from "../behaviors/level-control-server.js";
import { HomeAssistantEntityBehavior } from "../custom-behaviors/home-assistant-entity-behavior.js";
import { OnOffPlugInUnitDevice } from "@matter/main/devices";

const muteOnOffConfig: OnOffConfig = {
  turnOn: {
    action: "media_player.volume_mute",
    data: { is_volume_muted: false },
  },
  turnOff: {
    action: "media_player.volume_mute",
    data: { is_volume_muted: true },
  },
  isOn: (state: HomeAssistantEntityState<MediaPlayerDeviceAttributes>) => {
    return !state.attributes.is_volume_muted;
  },
};

const FallbackEndpointType = OnOffPlugInUnitDevice.with(
  BasicInformationServer,
  IdentifyServer,
  HomeAssistantEntityBehavior,
  OnOffServer,
);

const volumeLevelConfig: LevelControlConfig = {
  getValue: (state: HomeAssistantEntityState<MediaPlayerDeviceAttributes>) => {
    if (state.attributes.volume_level != null) {
      return state.attributes.volume_level * 100;
    }
    return 0;
  },
  getMinValue: (_: HomeAssistantEntityState) => 0,
  getMaxValue: (_: HomeAssistantEntityState) => 100,
  moveToLevel: {
    action: "media_player.volume_set",
    data: (value) => {
      return { volume_level: value / 100 };
    },
  },
};

const MediaPlayerEndpointType = SpeakerDevice.with(
  BasicInformationServer,
  IdentifyServer,
  HomeAssistantEntityBehavior,
  OnOffServer.set({ config: muteOnOffConfig }),
  LevelControlServer.set({ config: volumeLevelConfig }),
);

export function MediaPlayerDevice(
  homeAssistantEntity: HomeAssistantEntityBehavior.State,
  featureFlags?: BridgeFeatureFlags,
) {
  if (featureFlags?.matterSpeakers) {
    return MediaPlayerEndpointType.set({ homeAssistantEntity });
  } else {
    return FallbackEndpointType.set({ homeAssistantEntity });
  }
}
