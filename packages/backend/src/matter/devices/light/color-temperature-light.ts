import { ColorTemperatureLightDevice as Device } from "@matter/main/devices";
import { IdentifyServer } from "../../behaviors/identify-server.js";
import { BasicInformationServer } from "../../behaviors/basic-information-server.js";
import { OnOffServer } from "../../behaviors/on-off-server.js";
import { ColorControlServer } from "../../behaviors/color-control-server.js";
import { HomeAssistantBehavior } from "../../custom-behaviors/home-assistant-behavior.js";
import { LevelControlServer } from "../../behaviors/level-control-server.js";

export const ColorTemperatureLightType = Device.with(
  IdentifyServer,
  BasicInformationServer,
  HomeAssistantBehavior,
  OnOffServer,
  LevelControlServer,
  ColorControlServer.with("ColorTemperature"),
);
