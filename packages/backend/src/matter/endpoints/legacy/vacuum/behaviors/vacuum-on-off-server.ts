import { OnOffServer } from "../../../../behaviors/on-off-server.js";
import { RvcSupportedRunMode } from "../../../../behaviors/rvc-run-mode-server.js";
import { VacuumRvcRunModeServer } from "./vacuum-rvc-run-mode-server.js";

export const VacuumOnOffServer = OnOffServer({
  isOn: (_, agent) =>
    agent.get(VacuumRvcRunModeServer).state.currentMode ===
    RvcSupportedRunMode.Cleaning,
  turnOn: () => ({ action: "vacuum.start" }),
  turnOff: () => ({ action: "vacuum.stop" }),
}).with();
