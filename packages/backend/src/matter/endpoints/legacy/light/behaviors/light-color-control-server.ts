import {
  ColorConverter,
  type HomeAssistantEntityState,
  type LightDeviceAttributes,
  LightDeviceColorMode,
} from "@home-assistant-matter-hub/common";
import { ColorControl } from "@matter/main/clusters";
import type { ColorInstance } from "color";
import {
  type ColorControlConfig,
  ColorControlServer,
} from "../../../../behaviors/color-control-server.js";

function getMatterColor(
  entity: HomeAssistantEntityState<LightDeviceAttributes>,
): ColorInstance | undefined {
  let color: ColorInstance | undefined;
  if (entity.attributes.hs_color != null) {
    const [hue, saturation] = entity.attributes.hs_color;
    color = ColorConverter.fromHomeAssistantHS(hue, saturation);
  } else if (entity.attributes.rgbww_color != null) {
    const [r, g, b, cw, ww] = entity.attributes.rgbww_color;
    color = ColorConverter.fromRGBWW(r, g, b, cw, ww);
  } else if (entity.attributes.rgbw_color != null) {
    const [r, g, b, w] = entity.attributes.rgbw_color;
    color = ColorConverter.fromRGBW(r, g, b, w);
  } else if (entity.attributes.rgb_color != null) {
    const [r, g, b] = entity.attributes.rgb_color;
    color = ColorConverter.fromRGB(r, g, b);
  } else if (entity.attributes.xy_color != null) {
    const [x, y] = entity.attributes.xy_color;
    color = ColorConverter.fromXY(x, y);
  }
  return color;
}

const config: ColorControlConfig = {
  getCurrentMode: (entity: HomeAssistantEntityState<LightDeviceAttributes>) =>
    entity.attributes.color_mode === LightDeviceColorMode.COLOR_TEMP
      ? ColorControl.ColorMode.ColorTemperatureMireds
      : ColorControl.ColorMode.CurrentHueAndCurrentSaturation,
  getCurrentKelvin: (entity: HomeAssistantEntityState<LightDeviceAttributes>) =>
    entity.attributes.color_temp_kelvin,
  getMinColorTempKelvin: (
    entity: HomeAssistantEntityState<LightDeviceAttributes>,
  ) => entity.attributes.min_color_temp_kelvin,
  getMaxColorTempKelvin: (
    entity: HomeAssistantEntityState<LightDeviceAttributes>,
  ) => entity.attributes.max_color_temp_kelvin,
  getColor: (entity) => getMatterColor(entity),

  setTemperature: (temperatureKelvin) => ({
    action: "light.turn_on",
    data: {
      color_temp_kelvin: temperatureKelvin,
    },
  }),
  setColor: (color) => ({
    action: "light.turn_on",
    data: {
      hs_color: ColorConverter.toHomeAssistantHS(color),
    },
  }),
};

export const LightColorControlServer = ColorControlServer(config);
