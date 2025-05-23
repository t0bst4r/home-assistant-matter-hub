import {
  type VacuumDeviceAttributes,
  VacuumFanSpeed,
} from "@home-assistant-matter-hub/common";
import { RvcCleanMode } from "@matter/main/clusters";
import {
  RvcCleanModeServer,
  RvcSupportedCleanMode,
} from "../../../behaviors/rvc-clean-mode-server.js";

export const VacuumRvcCleanModeServer = RvcCleanModeServer({
  getCurrentMode: (entity) => {
    switch ((entity.attributes as VacuumDeviceAttributes)?.fan_speed) {
      case VacuumFanSpeed.low:
        return RvcSupportedCleanMode.Quiet;
      case VacuumFanSpeed.high:
        return RvcSupportedCleanMode.Turbo;
      case VacuumFanSpeed.max:
        return RvcSupportedCleanMode.Max;
      default:
        return RvcSupportedCleanMode.Normal;
    }
  },
  getSupportedModes: () => [
    {
      label: "Quiet",
      mode: RvcSupportedCleanMode.Quiet,
      modeTags: [
        { value: RvcCleanMode.ModeTag.Quiet },
        { value: RvcCleanMode.ModeTag.Vacuum },
      ],
    },
    {
      label: "Normal",
      mode: RvcSupportedCleanMode.Normal,
      modeTags: [
        { value: RvcCleanMode.ModeTag.Auto },
        { value: RvcCleanMode.ModeTag.Vacuum },
      ],
    },
    {
      label: "Turbo",
      mode: RvcSupportedCleanMode.Turbo,
      modeTags: [
        { value: RvcCleanMode.ModeTag.DeepClean },
        { value: RvcCleanMode.ModeTag.Vacuum },
      ],
    },
    {
      label: "Max",
      mode: RvcSupportedCleanMode.Max,
      modeTags: [
        { value: RvcCleanMode.ModeTag.Max },
        { value: RvcCleanMode.ModeTag.Vacuum },
      ],
    },
  ],
  changeFanSpeed: (vacuumFanSpeed) => {
    return {
      action: "vacuum.set_fan_speed",
      data: { fan_speed: vacuumFanSpeed },
    };
  },
});
