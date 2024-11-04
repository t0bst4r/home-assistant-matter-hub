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

export class LightDevice extends MatterDevice {
  constructor(homeAssistant: HomeAssistantBehavior.State) {
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

    const type = supportsColorControl
      ? ExtendedColorLightType
      : supportsColorTemperature
        ? ColorTemperatureLightType
        : supportsBrightness
          ? DimmableLightType
          : OnOffLightType;

    super(type, homeAssistant);
  }
}
