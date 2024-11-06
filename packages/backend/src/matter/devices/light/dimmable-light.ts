import { DimmableLightDevice as Device } from "@project-chip/matter.js/devices/DimmableLightDevice";
import { IdentifyServer } from "../../behaviors/identify-server.js";
import { BasicInformationServer } from "../../behaviors/basic-information-server.js";
import { OnOffServer } from "../../behaviors/on-off-server.js";
import { HomeAssistantBehavior } from "../../custom-behaviors/home-assistant-behavior.js";
import { LevelControlServer } from "../../behaviors/level-control-server.js";

export const DimmableLightType = Device.with(
  IdentifyServer,
  BasicInformationServer,
  HomeAssistantBehavior,
  OnOffServer,
  LevelControlServer,
);
