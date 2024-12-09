import { describe, expect, it } from "vitest";
import { FanControl } from "@matter/main/clusters";
import * as utils from "./fan-control-server-utils.js";
import { FanControlFeatures } from "./fan-control-server-utils.js";
import { FanDeviceDirection } from "@home-assistant-matter-hub/common";

import FanModeSequence = FanControl.FanModeSequence;
import FanMode = FanControl.FanMode;
import AirflowDirection = FanControl.AirflowDirection;

describe("FanControlServerUtils", () => {
  describe("getMatterFanModeSequence", () => {
    it.each<[FanControlFeatures, FanModeSequence]>([
      [{ auto: true, multiSpeed: true }, FanModeSequence.OffLowMedHighAuto],
      [{ auto: true, multiSpeed: false }, FanModeSequence.OffHighAuto],
      [{ auto: false, multiSpeed: true }, FanModeSequence.OffLowMedHigh],
      [{ auto: false, multiSpeed: false }, FanModeSequence.OffHigh],
    ])("should select the correct mode (%s)", (features, expected) => {
      expect(utils.getMatterFanModeSequence(features)).toEqual(expected);
    });
  });

  describe("getMatterFanMode", () => {
    it("should return off when state is off", () => {
      expect(
        utils.getMatterFanMode(
          "off",
          81,
          undefined,
          FanModeSequence.OffLowMedHigh,
        ),
      ).toEqual(FanMode.Off);
    });

    it("should return off when state is on, but percentage is 0", () => {
      expect(
        utils.getMatterFanMode(
          "on",
          0,
          undefined,
          FanModeSequence.OffLowMedHigh,
        ),
      ).toEqual(FanMode.Off);
    });

    it("should return auto when preset_mode is Auto", () => {
      expect(
        utils.getMatterFanMode(
          "on",
          75,
          "Auto",
          FanModeSequence.OffLowMedHighAuto,
        ),
      ).toEqual(FanMode.Auto);
    });

    it.each([
      [0, FanMode.Off],
      [1, FanMode.Low],
      [12, FanMode.Low],
      [33, FanMode.Low],
      [34, FanMode.Medium],
      [40, FanMode.Medium],
      [50, FanMode.Medium],
      [66, FanMode.Medium],
      [67, FanMode.High],
      [75, FanMode.High],
      [90, FanMode.High],
      [100, FanMode.High],
    ])(
      "should return correct mode for sequence (%s -> %s)",
      (percentage, expected) => {
        expect(
          utils.getMatterFanMode(
            "on",
            percentage,
            undefined,
            FanModeSequence.OffLowMedHighAuto,
          ),
        ).toEqual(expected);
      },
    );
  });

  describe("getMatterAirflowDirection", () => {
    it.each([
      [FanDeviceDirection.FORWARD, AirflowDirection.Forward],
      [FanDeviceDirection.REVERSE, AirflowDirection.Reverse],
      [undefined, undefined],
    ])(
      "should select the correct matter AirflowDirection (%s)",
      (direction, expected) => {
        expect(utils.getMatterAirflowDirection(direction)).toEqual(expected);
      },
    );
  });

  describe("getDirectionFromMatter", () => {
    it.each([
      [AirflowDirection.Forward, FanDeviceDirection.FORWARD],
      [AirflowDirection.Reverse, FanDeviceDirection.REVERSE],
    ])(
      "should select the correct matter AirflowDirection (%s)",
      (direction, expected) => {
        expect(utils.getDirectionFromMatter(direction)).toEqual(expected);
      },
    );
  });

  describe("getSpeedPercentFromMatterFanMode", () => {
    it.each([
      [FanMode.Off, FanModeSequence.OffLowMedHighAuto, 0],
      [FanMode.Low, FanModeSequence.OffLowMedHighAuto, (1 / 3) * 100],
      [FanMode.Medium, FanModeSequence.OffLowMedHighAuto, (2 / 3) * 100],
      [FanMode.High, FanModeSequence.OffLowMedHighAuto, 100],
      [FanMode.Low, FanModeSequence.OffLowHigh, 50],
      [FanMode.Medium, FanModeSequence.OffLowHigh, 50],
      [FanMode.High, FanModeSequence.OffLowHigh, 100],
    ])(
      "should determine the correct speed (%s & %s)",
      (mode, sequence, expected) => {
        expect(
          utils.getSpeedPercentFromMatterFanMode(
            mode as
              | FanControl.FanMode.Off
              | FanControl.FanMode.Low
              | FanControl.FanMode.Medium
              | FanControl.FanMode.High,
            sequence,
          ),
        ).toEqual(expected);
      },
    );
  });

  describe("getNextStepValue", () => {
    it("should increase properly", () => {
      expect(
        utils.getNextStepValue(2, 4, {
          direction: FanControl.StepDirection.Increase,
        }),
      ).toEqual(3);
    });
    it("should decrease properly", () => {
      expect(
        utils.getNextStepValue(2, 4, {
          direction: FanControl.StepDirection.Decrease,
        }),
      ).toEqual(1);
    });

    it("should wrap properly", () => {
      expect(
        utils.getNextStepValue(0, 4, {
          direction: FanControl.StepDirection.Decrease,
          wrap: true,
          lowestOff: true,
        }),
      ).toEqual(4);
    });

    it("should not wrap properly", () => {
      expect(
        utils.getNextStepValue(0, 4, {
          direction: FanControl.StepDirection.Decrease,
          lowestOff: true,
        }),
      ).toEqual(0);
    });

    it("should ignore lowest when increasing with wrap", () => {
      expect(
        utils.getNextStepValue(4, 4, {
          direction: FanControl.StepDirection.Increase,
          lowestOff: false,
          wrap: true,
        }),
      ).toEqual(1);
    });

    it("should ignore lowest when decreasing with wrap", () => {
      expect(
        utils.getNextStepValue(1, 4, {
          direction: FanControl.StepDirection.Decrease,
          lowestOff: false,
          wrap: true,
        }),
      ).toEqual(4);
    });
  });
});
