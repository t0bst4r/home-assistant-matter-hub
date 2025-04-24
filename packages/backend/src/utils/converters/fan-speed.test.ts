import { FanControl } from "@matter/main/clusters";
import { describe, expect, it } from "vitest";
import { FanSpeed } from "./fan-speed.js";

describe("FanSpeed", () => {
  describe("step", () => {
    it("should increase properly", () => {
      expect(
        new FanSpeed(2, 4).step({
          direction: FanControl.StepDirection.Increase,
        }).currentSpeed,
      ).toEqual(3);
    });
    it("should decrease properly", () => {
      expect(
        new FanSpeed(2, 4).step({
          direction: FanControl.StepDirection.Decrease,
        }).currentSpeed,
      ).toEqual(1);
    });

    it("should wrap properly", () => {
      expect(
        new FanSpeed(0, 4).step({
          direction: FanControl.StepDirection.Decrease,
          wrap: true,
          lowestOff: true,
        }).currentSpeed,
      ).toEqual(4);
    });

    it("should not wrap properly", () => {
      expect(
        new FanSpeed(0, 4).step({
          direction: FanControl.StepDirection.Decrease,
          lowestOff: true,
        }).currentSpeed,
      ).toEqual(0);
    });

    it("should ignore lowest when increasing with wrap", () => {
      expect(
        new FanSpeed(4, 4).step({
          direction: FanControl.StepDirection.Increase,
          lowestOff: false,
          wrap: true,
        }).currentSpeed,
      ).toEqual(1);
    });

    it("should ignore lowest when decreasing with wrap", () => {
      expect(
        new FanSpeed(1, 4).step({
          direction: FanControl.StepDirection.Decrease,
          lowestOff: false,
          wrap: true,
        }).currentSpeed,
      ).toEqual(4);
    });
  });
});
