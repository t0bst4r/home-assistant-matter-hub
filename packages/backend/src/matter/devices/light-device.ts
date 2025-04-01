import {
  type LightDeviceAttributes,
  LightDeviceColorMode,
} from "@home-assistant-matter-hub/common";
import type { EndpointType } from "@matter/main";
import type { HomeAssistantEntityBehavior } from "../custom-behaviors/home-assistant-entity-behavior.js";
import { ColorTemperatureLightType } from "./light/color-temperature-light.js";
import { DimmableLightType } from "./light/dimmable-light.js";
import { ExtendedColorLightType } from "./light/extended-color-light.js";
import { OnOffLightType } from "./light/on-off-light-device.js";

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
  }
  if (supportsColorTemperature) {
    return ColorTemperatureLightType.set({ homeAssistantEntity });
  }
  if (supportsBrightness) {
    return DimmableLightType.set({ homeAssistantEntity });
  }
  return OnOffLightType.set({ homeAssistantEntity });
}
