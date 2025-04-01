import { LightDeviceColorMode } from "@home-assistant-matter-hub/common";
import { ColorControl } from "@matter/main/clusters";

export interface ColorControlFeatures {
  colorTemperature: boolean;
  hueSaturation: boolean;
}

export function getMatterColorMode(
  mode: LightDeviceColorMode | undefined,
  features: ColorControlFeatures,
): ColorControl.ColorMode {
  // This cluster is only used with HueSaturation, ColorTemperature or Both.
  // It is never used without any of them.
  if (features.colorTemperature && features.hueSaturation) {
    if (mode === LightDeviceColorMode.COLOR_TEMP) {
      return ColorControl.ColorMode.ColorTemperatureMireds;
    }
    return ColorControl.ColorMode.CurrentHueAndCurrentSaturation;
  }
  if (features.colorTemperature) {
    return ColorControl.ColorMode.ColorTemperatureMireds;
  }
  if (features.hueSaturation) {
    return ColorControl.ColorMode.CurrentHueAndCurrentSaturation;
  }
  throw new Error(
    "ColorControlServer does not support either HueSaturation or ColorTemperature",
  );
}
