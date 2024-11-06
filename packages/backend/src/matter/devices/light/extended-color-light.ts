import { ExtendedColorLightDevice as Device } from "@project-chip/matter.js/devices/ExtendedColorLightDevice";
import { IdentifyServer } from "../../behaviors/identify-server.js";
import { BasicInformationServer } from "../../behaviors/basic-information-server.js";
import { OnOffServer } from "../../behaviors/on-off-server.js";
import { ExtendedColorControlServer } from "../../behaviors/extended-color-control-server.js";
import { HomeAssistantBehavior } from "../../custom-behaviors/home-assistant-behavior.js";
import { LevelControlServer } from "../../behaviors/level-control-server.js";

export const ExtendedColorLightType = Device.with(
  IdentifyServer,
  BasicInformationServer,
  HomeAssistantBehavior,
  OnOffServer,
  LevelControlServer,
  ExtendedColorControlServer,
);
