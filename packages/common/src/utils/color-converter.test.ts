import Color from "color";
import { describe, expect, it } from "vitest";
import { ColorConverter } from "./color-converter.js";

describe("ColorConverter", () => {
  describe("fromHomeAssistantHS", () => {
    it("should convert Home Assistant HS to Color", () => {
      const color = ColorConverter.fromHomeAssistantHS(240, 100);
      expect(color.hsv().array()).toEqual([240, 100, 100]);
    });
  });

  describe("fromMatterHS", () => {
    it("should convert Matter HS to Color", () => {
      const color = ColorConverter.fromMatterHS(127, 254);
      const [h, s] = color.hsv().array();
      expect(h).toBeCloseTo(180, 0);
      expect(s).toBeCloseTo(100, 0);
    });
  });

  describe("fromXY", () => {
    it.each([
      [0.7006, 0.2993, 0, 100],
      [0.1724, 0.7468, 120, 100],
      [0.1355, 0.0399, 240, 100],
      [0.4323, 0.5, 60, 73],
      [0.3127, 0.329, 186, 4],
    ])("should convert XY to Color", (x, y, h, s) => {
      const [resultH, resultS] = ColorConverter.fromXY(x, y).hsv().array();
      expect(resultH).toBeCloseTo(h, 0);
      expect(resultS).toBeCloseTo(s, 0);
    });
  });

  describe("fromRGB", () => {
    it.each([
      [255, 0, 0, 0, 100],
      [0, 255, 0, 120, 100],
      [0, 0, 255, 240, 100],
      [255, 255, 0, 60, 100],
      [128, 128, 128, 0, 0],
    ])("should convert RGB to Color", (r, g, b, h, s) => {
      const [resultH, resultS] = ColorConverter.fromRGB(r, g, b).hsv().array();
      expect(resultH).toBeCloseTo(h, 0);
      expect(resultS).toBeCloseTo(s, 0);
    });
  });

  describe("fromRGBW", () => {
    it.each([
      [255, 0, 0, 120, 0, 53],
      [0, 255, 0, 60, 120, 76],
      [0, 0, 255, 170, 240, 33],
      [255, 255, 0, 100, 60, 61],
      [128, 128, 128, 150, 0, 0],
    ])("should convert RGBW to Color", (r, g, b, w, h, s) => {
      const [resultH, resultS] = ColorConverter.fromRGBW(r, g, b, w)
        .hsv()
        .array();
      expect(resultH).toBeCloseTo(h, 0);
      expect(resultS).toBeCloseTo(s, 0);
    });
  });

  describe("fromRGBWW", () => {
    it.each([
      [255, 0, 0, 60, 180, 0, 53],
      [0, 255, 0, 20, 100, 120, 76],
      [0, 0, 255, 140, 200, 240, 33],
      [255, 255, 0, 50, 150, 60, 61],
      [128, 128, 128, 100, 200, 0, 0],
    ])("should convert RGBWW to Color", (r, g, b, cw, ww, h, s) => {
      const [resultH, resultS] = ColorConverter.fromRGBWW(r, g, b, cw, ww)
        .hsv()
        .array();
      expect(resultH).toBeCloseTo(h, 0);
      expect(resultS).toBeCloseTo(s, 0);
    });
  });

  describe("toHomeAssistantHS", () => {
    it.each([
      [255, 0, 0, 0, 100],
      [0, 255, 0, 120, 100],
      [0, 0, 255, 240, 100],
      [255, 255, 0, 60, 100],
      [128, 128, 128, 0, 0],
    ])("should convert Color to Home Assistant HS", (r, g, b, h, s) => {
      const color = Color.rgb(r, g, b);
      const result = ColorConverter.toHomeAssistantHS(color);
      expect(result).toEqual([h, s]);
    });
  });

  describe("toMatterHS", () => {
    it.each([
      [0, 100, 0, 254],
      [120, 100, 85, 254],
      [240, 100, 169, 254],
      [60, 100, 42, 254],
      [0, 0, 0, 0],
    ])("should convert Color to Matter HS", (h, s, mh, ms) => {
      const color = Color.hsv(h, s, 100);
      const result = ColorConverter.toMatterHS(color);
      expect(result).toEqual([mh, ms]);
    });
  });

  describe("temperatureMiredsToKelvin", () => {
    it("should convert mireds to kelvin", () => {
      expect(ColorConverter.temperatureMiredsToKelvin(500)).toBeCloseTo(
        2000,
        0,
      );
      expect(ColorConverter.temperatureMiredsToKelvin(154)).toBeCloseTo(
        6494,
        0,
      );
    });
  });

  describe("temperatureKelvinToMireds", () => {
    it("should convert kelvin to mireds", () => {
      expect(ColorConverter.temperatureKelvinToMireds(2000)).toBeCloseTo(
        500,
        0,
      );
      expect(ColorConverter.temperatureKelvinToMireds(6494)).toBeCloseTo(
        154,
        0,
      );
    });

    it("should respect boundaries", () => {
      expect(
        ColorConverter.temperatureKelvinToMireds(1000, [150, 500]),
      ).toBeCloseTo(500, 0);
      expect(
        ColorConverter.temperatureKelvinToMireds(10000, [150, 500]),
      ).toBeCloseTo(150, 0);
    });
  });
});
