import {
  type LightDeviceAttributes,
  LightDeviceColorMode,
} from "@home-assistant-matter-hub/common";
import type { EndpointType } from "@matter/main";
import type { HomeAssistantEntityBehavior } from "../../../behaviors/home-assistant-entity-behavior.js";
import { ColorTemperatureLightType } from "./devices/color-temperature-light.js";
import { DimmableLightType } from "./devices/dimmable-light.js";
import { ExtendedColorLightType } from "./devices/extended-color-light.js";
import { OnOffLightType } from "./devices/on-off-light-device.js";

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

  const deviceType = supportsColorControl
    ? ExtendedColorLightType(supportsColorTemperature)
    : supportsColorTemperature
      ? ColorTemperatureLightType
      : supportsBrightness
        ? DimmableLightType
        : OnOffLightType;
  return deviceType.set({ homeAssistantEntity });
}
