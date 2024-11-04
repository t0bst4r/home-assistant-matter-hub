import { MatterDevice } from "../matter-device.js";
import { OnOffPlugInUnitDevice } from "@project-chip/matter.js/devices/OnOffPlugInUnitDevice";
import { OnOffServer } from "../behaviors/on-off-server.js";
import { BasicInformationServer } from "../behaviors/basic-information-server.js";
import { IdentifyServer } from "../behaviors/identify-server.js";
import { HomeAssistantBehavior } from "../custom-behaviors/home-assistant-behavior.js";

const SwitchEndpointType = OnOffPlugInUnitDevice.with(
  BasicInformationServer,
  IdentifyServer,
  HomeAssistantBehavior,
  OnOffServer,
);

export class SwitchDevice extends MatterDevice<typeof SwitchEndpointType> {
  constructor(homeAssistant: HomeAssistantBehavior.State) {
    super(SwitchEndpointType, homeAssistant);
  }
}
