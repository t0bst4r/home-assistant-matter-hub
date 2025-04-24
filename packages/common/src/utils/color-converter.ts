import Color, { type ColorInstance } from "color";

/*
 * Matter:
 *    Brightness: 0-254
 *    Hue: 0-254
 *    Saturation: 0-254
 *    colorTemperatureMireds: Samples 147 - 454
 *
 * Home Assistant:
 *    Brightness: 0-255
 *    Hue: 0-360
 *    Saturation: 0-100
 *    rgb: 255, 255, 255
 *
 * Color (js):
 *    Hue: 0-360
 *    Saturation: 0-100
 *    rgb: 0-255
 */

export abstract class ColorConverter {
  /**
   * Create a color object from `hs_color` value
   * @param hue Hue, Values between 0 and 360
   * @param saturation Saturation, Values between 0 and 100
   * @return Color
   */
  public static fromHomeAssistantHS(
    hue: number,
    saturation: number,
  ): ColorInstance {
    return Color.hsv(hue, saturation, 100);
  }

  /**
   * Create a color object from `hue` and `saturation` values set via Matter
   * @param hue Hue, Values between 0 and 255
   * @param saturation Saturation, Values between 0 and 255
   * @return Color
   */
  public static fromMatterHS(hue: number, saturation: number): ColorInstance {
    return Color.hsv(
      Math.round((hue / 254) * 360),
      Math.round((saturation / 254) * 100),
      100,
    );
  }

  /**
   * Create a color object from `x` and `y` values set via Matter.
   * This function was inspired by color utils of Home Assistant Core (`homeassistant.util.color.color_xy_brightness_to_RGB`).
   * @param x X, Values between 0 and 1
   * @param y Y, Values between 0 and 1
   * @return Color
   */
  static fromXY(x: number, y: number): ColorInstance {
    function toXYZ(x: number, y: number): [X: number, Y: number, Z: number] {
      const Y = 1.0;
      const X = (Y / y) * x;
      const Z = (Y / y) * (1 - x - y);
      return [X, Y, Z];
    }

    function toRGB_D65(
      X: number,
      Y: number,
      Z: number,
    ): [r: number, g: number, b: number] {
      const r = X * 1.656492 - Y * 0.354851 - Z * 0.255038;
      const g = -X * 0.707196 + Y * 1.655397 + Z * 0.036152;
      const b = X * 0.051713 - Y * 0.121364 + Z * 1.01153;
      return [r, g, b];
    }

    function applyReverseGammaCorrection(x: number): number {
      if (x <= 0.0031308) {
        return 12.92 * x;
      }
      return (1.0 + 0.055) * x ** (1.0 / 2.4) - 0.055;
    }

    const XYZ = toXYZ(x, y);
    let rgb = toRGB_D65(...XYZ)
      .map(applyReverseGammaCorrection)
      .map((v) => Math.max(v, 0));

    const maxValue = Math.max(...rgb);
    if (maxValue > 1) {
      rgb = rgb.map((v) => v / maxValue);
    }

    const [r, g, b] = rgb.map((v) => Math.round(v * 255));
    return ColorConverter.fromRGB(r, g, b);
  }

  /**
   * Create a color object from `rgb_color` value
   * @param r Red, 0-255
   * @param g Green, 0-255
   * @param b Blue, 0-255
   * @return Color
   */
  public static fromRGB(r: number, g: number, b: number): ColorInstance {
    return Color.rgb(r, g, b);
  }

  /**
   * Create a color object from `rgbw_color` value
   * @param r Red, 0-255
   * @param g Green, 0-255
   * @param b Blue, 0-255
   * @param w White, 0-255
   * @return Color
   */
  public static fromRGBW(
    r: number,
    g: number,
    b: number,
    w: number,
  ): ColorInstance {
    return ColorConverter.fromRGB(
      Math.min(255, r + w),
      Math.min(255, g + w),
      Math.min(255, b + w),
    );
  }

  /**
   * Create a color object from `rgbww_color` value
   * @param r Red, 0-255
   * @param g Green, 0-255
   * @param b Blue, 0-255
   * @param cw Cold White, 0-255
   * @param ww Warm White, 0-255
   * @returns
   */
  public static fromRGBWW(
    r: number,
    g: number,
    b: number,
    cw: number,
    ww: number,
  ): ColorInstance {
    return ColorConverter.fromRGBW(r, g, b, (cw + ww) / 2);
  }

  /**
   * Extract Hue and Saturation compatible with Home Assistant
   * @param color The Color
   * @return [hue, saturation]
   */
  public static toHomeAssistantHS(
    color: ColorInstance,
  ): [hue: number, saturation: number] {
    const [h, s] = color.hsv().array();
    return [h, s];
  }

  /**
   * Extract Hue and Saturation compatible with Matter
   * @param color The Color
   * @return [hue, saturation]
   */
  public static toMatterHS(
    color: ColorInstance,
  ): [hue: number, saturation: number] {
    const [h, s] = color.hsv().array();
    return [Math.round((h / 360) * 254), Math.round((s / 100) * 254)];
  }

  /**
   * Convert Color Tempareture from Mireds to Kelvin
   * @param temperatureMireds Temperature in Mireds
   * @return Temperature in Kelvin
   */
  public static temperatureMiredsToKelvin(temperatureMireds: number): number {
    return 1_000_000 / temperatureMireds;
  }

  /**
   * Convert Color Tempareture from Kelvin to Mireds
   * @param temperatureKelvin Temperature in Kelvin
   * @param rounding Whether to floor or to ceil after conversion
   * @param boundaries Min and Max Boundaries to apply
   * @return Temperature in Mireds
   */
  public static temperatureKelvinToMireds(
    temperatureKelvin: number,
    boundaries: [min: number, max: number] = [0, 65279],
  ): number {
    const result = 1_000_000 / temperatureKelvin;
    const [min, max] = boundaries;
    return Math.min(Math.max(result, min), max);
  }
}
