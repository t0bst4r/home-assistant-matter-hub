import { ExtendedColorLightDevice as Device } from "@matter/main/devices";
import { IdentifyServer } from "../../behaviors/identify-server.js";
import { BasicInformationServer } from "../../behaviors/basic-information-server.js";
import { HomeAssistantEntityBehavior } from "../../custom-behaviors/home-assistant-entity-behavior.js";
import { ColorControlServer } from "../../behaviors/color-control-server.js";
import { LightOnOffServer } from "./light-on-off-server.js";
import { LightLevelControlServer } from "./light-level-control-server.js";

export const ExtendedColorLightType = (supportsTemperature: boolean) => {
  const colorControlServer = supportsTemperature
    ? ColorControlServer.with("HueSaturation", "ColorTemperature").set({
        config: {
          expandMinMaxTemperature: true,
        },
      })
    : ColorControlServer.with("HueSaturation");
  return Device.with(
    IdentifyServer,
    BasicInformationServer,
    HomeAssistantEntityBehavior,
    LightOnOffServer,
    LightLevelControlServer,
    colorControlServer,
  );
};
