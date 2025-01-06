import { RoboticVacuumCleanerDevice } from "@matter/main/devices";
import { IdentifyServer } from "../behaviors/identify-server.js";
import { BasicInformationServer } from "../behaviors/basic-information-server.js";
import { HomeAssistantEntityBehavior } from "../custom-behaviors/home-assistant-entity-behavior.js";
import { RvcRunModeServer } from "../behaviors/rvc-run-mode-server.js";
import { RvcOperationalStateServer } from "../behaviors/rvc-operational-state-server.js";
import { OnOffServer } from "../behaviors/on-off-server.js";

const deviceType = RoboticVacuumCleanerDevice.with(
  IdentifyServer,
  BasicInformationServer,
  HomeAssistantEntityBehavior,
  OnOffServer,
  RvcRunModeServer,
  RvcOperationalStateServer,
);

export function VacuumDevice(
  homeAssistantEntity: HomeAssistantEntityBehavior.State,
) {
  return deviceType.set({ homeAssistantEntity });
}
