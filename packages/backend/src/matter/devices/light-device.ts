import {
  LightDeviceAttributes,
  LightDeviceColorMode,
} from "@home-assistant-matter-hub/common";
import { ExtendedColorLightType } from "./light/extended-color-light.js";
import { ColorTemperatureLightType } from "./light/color-temperature-light.js";
import { DimmableLightType } from "./light/dimmable-light.js";
import { OnOffLightType } from "./light/on-off-light-device.js";
import { HomeAssistantEntityBehavior } from "../custom-behaviors/home-assistant-entity-behavior.js";
import { EndpointType } from "@matter/main";

const brightnessModes: LightDeviceColorMode[] = Object.values(
  LightDeviceColorMode,
)
  .filter((mode) => mode !== LightDeviceColorMode.UNKNOWN)
  .filter((mode) => mode !== LightDeviceColorMode.ONOFF);

const colorModes: LightDeviceColorMode[] = [
  LightDeviceColorMode.HS,
  LightDeviceColorMode.RGB,
  LightDeviceColorMode.XY,
  LightDeviceColorMode.RGBW,
  LightDeviceColorMode.RGBWW,
];

export function LightDevice(
  homeAssistantEntity: HomeAssistantEntityBehavior.State,
): EndpointType {
  const attributes = homeAssistantEntity.entity.state
    .attributes as LightDeviceAttributes;

  const supportedColorModes: LightDeviceColorMode[] =
    attributes.supported_color_modes ?? [];
  const supportsBrightness = supportedColorModes.some((mode) =>
    brightnessModes.includes(mode),
  );
  const supportsColorControl =
    !!attributes.hs_color ||
    supportedColorModes.some((mode) => colorModes.includes(mode));
  const supportsColorTemperature = supportedColorModes.includes(
    LightDeviceColorMode.COLOR_TEMP,
  );

  if (supportsColorControl) {
    return ExtendedColorLightType(supportsColorTemperature).set({
      homeAssistantEntity,
    });
  } else if (supportsColorTemperature) {
    return ColorTemperatureLightType.set({ homeAssistantEntity });
  } else if (supportsBrightness) {
    return DimmableLightType.set({ homeAssistantEntity });
  } else {
    return OnOffLightType.set({ homeAssistantEntity });
  }
}
