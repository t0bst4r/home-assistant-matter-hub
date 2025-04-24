import { VacuumState } from "@home-assistant-matter-hub/common";
import { RvcRunMode } from "@matter/main/clusters";
import {
  RvcRunModeServer,
  RvcSupportedRunMode,
} from "../../../behaviors/rvc-run-mode-server.js";

export const VacuumRvcRunModeServer = RvcRunModeServer({
  getCurrentMode: (entity) =>
    [VacuumState.cleaning].includes(entity.state as VacuumState)
      ? RvcSupportedRunMode.Cleaning
      : RvcSupportedRunMode.Idle,
  getSupportedModes: () => [
    {
      label: "Idle",
      mode: RvcSupportedRunMode.Idle,
      modeTags: [{ value: RvcRunMode.ModeTag.Idle }],
    },
    {
      label: "Cleaning",
      mode: RvcSupportedRunMode.Cleaning,
      modeTags: [{ value: RvcRunMode.ModeTag.Cleaning }],
    },
  ],

  start: () => ({ action: "vacuum.start" }),
  returnToBase: () => ({ action: "vacuum.return_to_base" }),
  pause: () => ({ action: "vacuum.pause" }),
});
