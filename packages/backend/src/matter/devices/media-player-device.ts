import { MatterDevice } from "../matter-device.js";
import { OnOffPlugInUnitDevice } from "@matter/main/devices";
import { OnOffServer } from "../behaviors/on-off-server.js";
import { BasicInformationServer } from "../behaviors/basic-information-server.js";
import { IdentifyServer } from "../behaviors/identify-server.js";
import { HomeAssistantBehavior } from "../custom-behaviors/home-assistant-behavior.js";

const MediaPlayerEndpointType = OnOffPlugInUnitDevice.with(
  BasicInformationServer,
  IdentifyServer,
  HomeAssistantBehavior,
  OnOffServer,
);

export function MediaPlayerDevice(homeAssistant: HomeAssistantBehavior.State) {
  return new MatterDevice(MediaPlayerEndpointType, homeAssistant);
}
