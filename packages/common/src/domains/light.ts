export enum LightDeviceColorMode {
  UNKNOWN = "unknown",
  ONOFF = "onoff",
  BRIGHTNESS = "brightness",
  COLOR_TEMP = "color_temp",
  HS = "hs",
  XY = "xy",
  RGB = "rgb",
  RGBW = "rgbw",
  RGBWW = "rgbww",
  WHITE = "white",
}

export interface LightDeviceAttributes {
  supported_color_modes?: LightDeviceColorMode[];
  color_mode?: LightDeviceColorMode;
  brightness?: number;
  color_temp_kelvin?: number;
  min_color_temp_kelvin?: number;
  max_color_temp_kelvin?: number;
  hs_color?: [number, number];
  xy_color?: [number, number];
  rgb_color?: [number, number, number];
  rgbw_color?: [number, number, number, number];
  rgbww_color?: [number, number, number, number, number];
}
