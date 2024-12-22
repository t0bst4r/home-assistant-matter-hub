import { ColorTemperatureLightDevice as Device } from "@matter/main/devices";
import { IdentifyServer } from "../../behaviors/identify-server.js";
import { BasicInformationServer } from "../../behaviors/basic-information-server.js";
import { ColorControlServer } from "../../behaviors/color-control-server.js";
import { HomeAssistantEntityBehavior } from "../../custom-behaviors/home-assistant-entity-behavior.js";
import { LightLevelControlServer } from "./light-level-control-server.js";
import { LightOnOffServer } from "./light-on-off-server.js";

export const ColorTemperatureLightType = Device.with(
  IdentifyServer,
  BasicInformationServer,
  HomeAssistantEntityBehavior,
  LightOnOffServer,
  LightLevelControlServer,
  ColorControlServer.with("ColorTemperature").set({
    config: {
      expandMinMaxTemperature: true,
    },
  }),
);
