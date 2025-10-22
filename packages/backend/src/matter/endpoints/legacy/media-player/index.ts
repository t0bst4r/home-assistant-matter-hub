import {
  type MediaPlayerDeviceAttributes,
  MediaPlayerDeviceFeature,
} from "@home-assistant-matter-hub/common";
import { SpeakerDevice } from "@matter/main/devices";
import { testBit } from "../../../../utils/test-bit.js";
import { BasicInformationServer } from "../../../behaviors/basic-information-server.js";
import { HomeAssistantEntityBehavior } from "../../../behaviors/home-assistant-entity-behavior.js";
import { IdentifyServer } from "../../../behaviors/identify-server.js";
import type { LevelControlFeatures } from "../../../behaviors/level-control-server.js";
import { MediaPlayerLevelControlServer } from "./behaviors/media-player-level-control-server.js";
import { MediaPlayerMediaInputServer } from "./behaviors/media-player-media-input-server.js";
import { MediaPlayerOnOffServer } from "./behaviors/media-player-on-off-server.js";

const SpeakerEndpointType = SpeakerDevice.with(
  BasicInformationServer,
  IdentifyServer,
  HomeAssistantEntityBehavior,
);

export function MediaPlayerDevice(
  homeAssistantEntity: HomeAssistantEntityBehavior.State,
) {
  const attributes = homeAssistantEntity.entity.state
    .attributes as MediaPlayerDeviceAttributes;
  const supportedFeatures = attributes.supported_features ?? 0;

  // TODO: Support power control, which needs to be implemented as another
  // OnOffServer on a separate endpoint for this device.

  let device = SpeakerEndpointType;
  const supportsMute = testBit(
    supportedFeatures,
    MediaPlayerDeviceFeature.VOLUME_MUTE,
  );
  const supportsVolume = testBit(
    supportedFeatures,
    MediaPlayerDeviceFeature.VOLUME_SET,
  );

  if (supportsMute) {
    device = device.with(MediaPlayerOnOffServer);
  }

  if (supportsVolume) {
    const volumeFeatures: LevelControlFeatures = [];
    if (supportsMute) {
      volumeFeatures.push("OnOff");
    }
    device = device.with(MediaPlayerLevelControlServer.with(...volumeFeatures));
  }

  if (testBit(supportedFeatures, MediaPlayerDeviceFeature.SELECT_SOURCE)) {
    device = device.with(MediaPlayerMediaInputServer);
  }
  return device.set({ homeAssistantEntity });
}
