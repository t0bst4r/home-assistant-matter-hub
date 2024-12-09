import {
  FanDeviceAttributes,
  FanDeviceDirection,
} from "@home-assistant-matter-hub/common";
import { FanControl } from "@matter/main/clusters/fan-control";

export interface FanControlFeatures {
  auto: boolean;
  multiSpeed: boolean;
}

/**
 * Select best fan mode sequence based on supported features
 * @param features The supported features
 */
export function getMatterFanModeSequence(
  features: FanControlFeatures,
): FanControl.FanModeSequence {
  if (features.multiSpeed) {
    return features.auto
      ? FanControl.FanModeSequence.OffLowMedHighAuto
      : FanControl.FanModeSequence.OffLowMedHigh;
  } else {
    return features.auto
      ? FanControl.FanModeSequence.OffHighAuto
      : FanControl.FanModeSequence.OffHigh;
  }
}

/**
 * Select best fan mode based on the entity data and the supported sequence
 * @param state The actual state of the entity. Used to determine if it's off.
 * @param percentage The actual percentage of the fan. Used to determine its mode
 * @param presetMode The current preset_mode. Used to determine "auto"
 * @param fanModeSequence The supported sequence / supported modes
 */
export function getMatterFanMode(
  state: "off" | string,
  percentage: FanDeviceAttributes["percentage"],
  presetMode: FanDeviceAttributes["preset_mode"],
  fanModeSequence: FanControl.FanModeSequence,
): FanControl.FanMode {
  percentage = percentage ?? 0;
  if (state == "off" || percentage === 0) {
    return FanControl.FanMode.Off;
  } else if (_autoSupported(fanModeSequence) && presetMode == "Auto") {
    return FanControl.FanMode.Auto;
  }
  const sequence = _fanModesForSequence(fanModeSequence);
  const modeIndex = Math.ceil((percentage / 100) * sequence.length) - 1;
  return sequence[modeIndex];
}

/**
 * Calculate the speed level percentage based on the selected fan mode
 * @param mode The fan mode
 * @param fanModeSequence The supported sequence
 */
export function getSpeedPercentFromMatterFanMode(
  mode:
    | FanControl.FanMode.Off
    | FanControl.FanMode.Low
    | FanControl.FanMode.Medium
    | FanControl.FanMode.High,
  fanModeSequence: FanControl.FanModeSequence,
): number {
  if (mode === FanControl.FanMode.Off) {
    return 0;
  }
  const sequence = _fanModesForSequence(fanModeSequence);
  let index = sequence.indexOf(mode);
  if (index == -1) {
    index = 0;
  }
  const percent = (index + 1) / sequence.length;
  return percent * 100;
}

/**
 * Convert Fan Direction from Home Assistant to the matter enum
 * @param direction The fan direction
 */
export function getMatterAirflowDirection(
  direction?: FanDeviceDirection,
): FanControl.AirflowDirection | undefined {
  if (direction == FanDeviceDirection.FORWARD) {
    return FanControl.AirflowDirection.Forward;
  } else if (direction == FanDeviceDirection.REVERSE) {
    return FanControl.AirflowDirection.Reverse;
  }
  return undefined;
}

/**
 * Convert Fan Direction from matter to the Home Assistant enum
 * @param direction The fan direction
 */
export function getDirectionFromMatter(
  direction: FanControl.AirflowDirection,
): FanDeviceDirection {
  if (direction == FanControl.AirflowDirection.Forward) {
    return FanDeviceDirection.FORWARD;
  }
  return FanDeviceDirection.REVERSE;
}

/**
 * Get the next step value. Returns the current speed if next value would be invalid.
 * @param speed The current speed
 * @param speedMax The max speed
 * @param request The step request
 */
export function getNextStepValue(
  speed: number,
  speedMax: number,
  request: FanControl.StepRequest,
): number {
  const direction =
    request.direction === FanControl.StepDirection.Increase ? 1 : -1;
  let next = speed + direction;
  if (next === 0 && !request.lowestOff) {
    next += direction;
  }
  if (request.wrap) {
    if (next < 0) {
      next = speedMax;
    } else if (next > speedMax) {
      next = !request.lowestOff ? 1 : 0;
    }
  }
  if (next < 0 || next > speedMax) {
    return speed;
  }
  return next;
}

/**
 * Get the list of supported fan modes (without auto and off) based on the fan mode sequence
 * @param sequence The fan mode sequence of the fan.
 */
function _fanModesForSequence(
  sequence: FanControl.FanModeSequence,
): FanControl.FanMode[] {
  switch (sequence) {
    case FanControl.FanModeSequence.OffLowMedHigh:
    case FanControl.FanModeSequence.OffLowMedHighAuto:
      return [
        FanControl.FanMode.Low,
        FanControl.FanMode.Medium,
        FanControl.FanMode.High,
      ];
    case FanControl.FanModeSequence.OffLowHigh:
    case FanControl.FanModeSequence.OffLowHighAuto:
      return [FanControl.FanMode.Low, FanControl.FanMode.High];
    case FanControl.FanModeSequence.OffHigh:
    case FanControl.FanModeSequence.OffHighAuto:
      return [FanControl.FanMode.High];
  }
}

/**
 * Check if the current fan mode sequence supports auto mode
 * @param sequence
 */
function _autoSupported(sequence: FanControl.FanModeSequence): boolean {
  switch (sequence) {
    case FanControl.FanModeSequence.OffLowMedHighAuto:
    case FanControl.FanModeSequence.OffLowHighAuto:
    case FanControl.FanModeSequence.OffHighAuto:
      return true;
    case FanControl.FanModeSequence.OffLowMedHigh:
    case FanControl.FanModeSequence.OffLowHigh:
    case FanControl.FanModeSequence.OffHigh:
      return false;
  }
}
