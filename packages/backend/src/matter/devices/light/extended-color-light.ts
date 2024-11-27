import { ExtendedColorLightDevice as Device } from "@matter/main/devices";
import { IdentifyServer } from "../../behaviors/identify-server.js";
import { BasicInformationServer } from "../../behaviors/basic-information-server.js";
import { OnOffServer } from "../../behaviors/on-off-server.js";
import { HomeAssistantEntityBehavior } from "../../custom-behaviors/home-assistant-entity-behavior.js";
import { LevelControlServer } from "../../behaviors/level-control-server.js";
import { ColorControlServer } from "../../behaviors/color-control-server.js";
import { lightLevelControlConfig } from "./light-level-control-config.js";

export const ExtendedColorLightType = (supportsTemperature: boolean) => {
  const colorControlServer = supportsTemperature
    ? ColorControlServer.with("HueSaturation", "ColorTemperature")
    : ColorControlServer.with("HueSaturation");
  return Device.with(
    IdentifyServer,
    BasicInformationServer,
    HomeAssistantEntityBehavior,
    OnOffServer,
    LevelControlServer.set({ config: lightLevelControlConfig }),
    colorControlServer,
  );
};
