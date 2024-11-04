import { ColorTemperatureLightDevice as Device } from "@project-chip/matter.js/devices/ColorTemperatureLightDevice";
import { IdentifyServer } from "../../behaviors/identify-server.js";
import { BasicInformationServer } from "../../behaviors/basic-information-server.js";
import { OnOffServer } from "../../behaviors/on-off-server.js";
import { LightLevelControlServer } from "./light-level-control-server.js";
import { ColorTemperatureControlServer } from "../../behaviors/color-temperature-control-server.js";
import { HomeAssistantBehavior } from "../../custom-behaviors/home-assistant-behavior.js";

export const ColorTemperatureLightType = Device.with(
  IdentifyServer,
  BasicInformationServer,
  HomeAssistantBehavior,
  OnOffServer,
  LightLevelControlServer,
  ColorTemperatureControlServer,
);
