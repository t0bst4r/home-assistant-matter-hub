import Color from "color";

/*
 * Matter:
 *    Brightness: 0-255
 *    Hue: 0-255
 *    Saturation: 0-255
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
  public static fromHomeAssistantHS(hue: number, saturation: number): Color {
    return Color.hsv(hue, saturation, 100);
  }

  /**
   * Create a color object from `hue` and `saturation` values set via Matter
   * @param hue Hue, Values between 0 and 255
   * @param saturation Saturation, Values between 0 and 255
   * @return Color
   */
  public static fromMatterHS(hue: number, saturation: number): Color {
    return Color.hsv((hue / 254) * 360, (saturation / 254) * 100, 100);
  }

  /**
   * Create a color object from `x` and `y` values set via Matter.
   * This function was inspired by color utils of Home Assistant Core (`homeassistant.util.color.color_xy_brightness_to_RGB`).
   * @param x X, Values between 0 and 1
   * @param y Y, Values between 0 and 1
   * @return Color
   */
  static fromXY(x: number, y: number): Color {
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
      const r = X * 1.656492 - Y * 0.354851 - Z * 0.255038,
        g = -X * 0.707196 + Y * 1.655397 + Z * 0.036152,
        b = X * 0.051713 - Y * 0.121364 + Z * 1.01153;
      return [r, g, b];
    }

    function applyReverseGammaCorrection(x: number): number {
      if (x <= 0.0031308) {
        return 12.92 * x;
      } else {
        return (1.0 + 0.055) * Math.pow(x, 1.0 / 2.4) - 0.055;
      }
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
    return this.fromRGB(r, g, b);
  }

  /**
   * Create a color object from `rgb_color` value
   * @param r Red, 0-255
   * @param g Green, 0-255
   * @param b Blue, 0-255
   * @return Color
   */
  public static fromRGB(r: number, g: number, b: number): Color {
    return Color.rgb(r, g, b);
  }

  /**
   * Extract Hue and Saturation compatible with Home Assistant
   * @param color The Color
   * @return [hue, saturation]
   */
  public static toHomeAssistantHS(
    color: Color,
  ): [hue: number, saturation: number] {
    const [h, s] = color.hsv().array();
    return [h, s];
  }

  /**
   * Extract R, G, B values from a color
   * @param color The color
   * @return [r, g, b]
   */
  public static toRGB(color: Color): [r: number, g: number, b: number] {
    const [r, g, b] = color.rgb().array();
    return [r, g, b];
  }

  /**
   * Extract Hue and Saturation compatible with Matter
   * @param color The Color
   * @return [hue, saturation]
   */
  public static toMatterHS(color: Color): [hue: number, saturation: number] {
    const [h, s] = color.hsv().array();
    return [(h / 360) * 254, (s / 100) * 254];
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
   * @return Temperature in Mireds
   */
  public static temperatureKelvinToMireds(temperatureKelvin: number): number {
    return 1_000_000 / temperatureKelvin;
  }

  public static temperatureKelvinToColor(temperatureKelvin: number): Color {
    const temp = temperatureKelvin / 100;
    let red: number, green: number, blue: number;

    if (temp <= 66) {
      red = 255;
      green = temp;
      green = 99.4708025861 * Math.log(green) - 161.1195681661;
      if (temp <= 19) {
        blue = 0;
      } else {
        blue = temp - 10;
        blue = 138.5177312231 * Math.log(blue) - 305.0447927307;
      }
    } else {
      red = temp - 60;
      red = 329.698727446 * Math.pow(red, -0.1332047592);
      green = temp - 60;
      green = 288.1221695283 * Math.pow(green, -0.0755148492);
      blue = 255;
    }

    function boundary(value: number): number {
      return Math.min(Math.max(value, 0), 255);
    }

    return this.fromRGB(boundary(red), boundary(green), boundary(blue));
  }

  public static temperatureMiredsToColor(temperatureMireds: number): Color {
    return this.temperatureKelvinToColor(
      this.temperatureMiredsToKelvin(temperatureMireds),
    );
  }
}
