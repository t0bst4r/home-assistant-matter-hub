import { OnOffLightDevice as Device } from "@project-chip/matter.js/devices/OnOffLightDevice";
import { IdentifyServer } from "../../behaviors/identify-server.js";
import { BasicInformationServer } from "../../behaviors/basic-information-server.js";
import { OnOffServer } from "../../behaviors/on-off-server.js";
import { HomeAssistantBehavior } from "../../custom-behaviors/home-assistant-behavior.js";

export const OnOffLightType = Device.with(
  IdentifyServer,
  BasicInformationServer,
  HomeAssistantBehavior,
  OnOffServer,
);
