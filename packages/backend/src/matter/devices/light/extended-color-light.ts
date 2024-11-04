import { ExtendedColorLightDevice as Device } from "@project-chip/matter.js/devices/ExtendedColorLightDevice";
import { IdentifyServer } from "../../behaviors/identify-server.js";
import { BasicInformationServer } from "../../behaviors/basic-information-server.js";
import { OnOffServer } from "../../behaviors/on-off-server.js";
import { LightLevelControlServer } from "./light-level-control-server.js";
import { ExtendedColorControlServer } from "../../behaviors/extended-color-control-server.js";
import { HomeAssistantBehavior } from "../../custom-behaviors/home-assistant-behavior.js";

export const ExtendedColorLightType = Device.with(
  IdentifyServer,
  BasicInformationServer,
  HomeAssistantBehavior,
  OnOffServer,
  LightLevelControlServer,
  ExtendedColorControlServer,
);
