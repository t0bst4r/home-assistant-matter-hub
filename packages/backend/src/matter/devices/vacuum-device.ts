import {
  type BridgeFeatureFlags,
  VacuumDeviceFeature,
} from "@home-assistant-matter-hub/common";
import type { EndpointType } from "@matter/main";
import { RvcRunMode } from "@matter/main/clusters/rvc-run-mode";
import { RoboticVacuumCleanerDevice } from "@matter/main/devices";
import { testBit } from "../../utils/test-bit.js";
import { BasicInformationServer } from "../behaviors/basic-information-server.js";
import { IdentifyServer } from "../behaviors/identify-server.js";
import { type OnOffConfig, OnOffServer } from "../behaviors/on-off-server.js";
import { RvcOperationalStateServer } from "../behaviors/rvc-operational-state-server.js";
import { RvcRunModeServer } from "../behaviors/rvc-run-mode-server.js";
import { HomeAssistantEntityBehavior } from "../custom-behaviors/home-assistant-entity-behavior.js";

const vacuumOnOffConfig: OnOffConfig = {
  isOn: (_, agent) =>
    agent.get(RvcRunModeServer).state.currentMode ===
    RvcRunMode.ModeTag.Cleaning,
  turnOn: {
    action: "vacuum.start",
  },
  turnOff: {
    action: "vacuum.stop",
  },
};

const VacuumEndpointType = RoboticVacuumCleanerDevice.with(
  BasicInformationServer,
  IdentifyServer,
  HomeAssistantEntityBehavior,
  RvcOperationalStateServer,
  RvcRunModeServer,
);

export function VacuumDevice(
  homeAssistantEntity: HomeAssistantEntityBehavior.State,
  _featureFlags?: BridgeFeatureFlags,
): EndpointType | undefined {
  if (homeAssistantEntity.entity.state === undefined) {
    return undefined;
  }

  const attributes = homeAssistantEntity.entity.state.attributes;
  const supportedFeatures = attributes.supported_features ?? 0;
  const device = VacuumEndpointType.set({ homeAssistantEntity });
  console.log(supportedFeatures);
  if (testBit(supportedFeatures, VacuumDeviceFeature.START)) {
    return device.with(
      OnOffServer
        // TODO: remove after official matter-js 0.13.0 release
        .with("Lighting")
        .set({ config: vacuumOnOffConfig }),
    );
  }
  return device;
}
