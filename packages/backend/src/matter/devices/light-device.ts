import { MatterDevice } from "../matter-device.js";
import {
  HomeAssistantEntityState,
  LightDeviceAttributes,
  LightDeviceColorMode,
} from "@home-assistant-matter-hub/common";
import { ExtendedColorLightType } from "./light/extended-color-light.js";
import { ColorTemperatureLightType } from "./light/color-temperature-light.js";
import { DimmableLightType } from "./light/dimmable-light.js";
import { OnOffLightType } from "./light/on-off-light-device.js";
import { HomeAssistantBehavior } from "../custom-behaviors/home-assistant-behavior.js";
import { LevelControlConfig } from "../behaviors/level-control-server.js";

const brightnessModes: LightDeviceColorMode[] = Object.values(
  LightDeviceColorMode,
)
  .filter((mode) => mode !== LightDeviceColorMode.UNKNOWN)
  .filter((mode) => mode !== LightDeviceColorMode.ONOFF);

const colorModes: LightDeviceColorMode[] = [
  LightDeviceColorMode.HS,
  LightDeviceColorMode.RGB,
  LightDeviceColorMode.XY,
  // TODO: ColorMode.RGBW, not yet supported
  // TODO: ColorMode.RGBWW, not yet supported
];

const levelControlConfig: LevelControlConfig = {
  getValue: (state: HomeAssistantEntityState<LightDeviceAttributes>) => {
    const brightness = state.attributes.brightness;
    if (brightness != null) {
      return (brightness / 255) * 254;
    }
    return 0;
  },
  moveToLevel: {
    action: "light.turn_on",
    data: (brightness) => ({ brightness: (brightness / 254) * 255 }),
  },
};

export function LightDevice(homeAssistant: HomeAssistantBehavior.State) {
  const entity =
    homeAssistant.entity as HomeAssistantEntityState<LightDeviceAttributes>;
  const supportedColorModes: LightDeviceColorMode[] =
    entity.attributes.supported_color_modes ?? [];
  const supportsBrightness = supportedColorModes.some((mode) =>
    brightnessModes.includes(mode),
  );
  const supportsColorControl = supportedColorModes.some((mode) =>
    colorModes.includes(mode),
  );
  const supportsColorTemperature = supportedColorModes.includes(
    LightDeviceColorMode.COLOR_TEMP,
  );

  if (supportsColorControl) {
    return new MatterDevice(ExtendedColorLightType, homeAssistant, {
      levelControl: { config: levelControlConfig },
    });
  } else if (supportsColorTemperature) {
    return new MatterDevice(ColorTemperatureLightType, homeAssistant, {
      levelControl: { config: levelControlConfig },
    });
  } else if (supportsBrightness) {
    return new MatterDevice(DimmableLightType, homeAssistant, {
      levelControl: { config: levelControlConfig },
    });
  } else {
    return new MatterDevice(OnOffLightType, homeAssistant);
  }
}
