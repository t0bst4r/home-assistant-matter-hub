import { MatterDevice } from "../matter-device.js";
import { OnOffPlugInUnitDevice } from "@matter/main/devices";
import { OnOffServer } from "../behaviors/on-off-server.js";
import { BasicInformationServer } from "../behaviors/basic-information-server.js";
import { IdentifyServer } from "../behaviors/identify-server.js";
import { HomeAssistantBehavior } from "../custom-behaviors/home-assistant-behavior.js";
import { CompatibilityMode } from "@home-assistant-matter-hub/common";

const MediaPlayerEndpointType = OnOffPlugInUnitDevice.with(
  BasicInformationServer,
  IdentifyServer,
  HomeAssistantBehavior,
  OnOffServer,
);

export function MediaPlayerDevice(
  homeAssistant: HomeAssistantBehavior.State,
  _compatibility: CompatibilityMode,
) {
  return new MatterDevice(MediaPlayerEndpointType, homeAssistant);
}
