import type { EndpointType } from "@matter/main";
import { OnOffPlugInUnitDevice } from "@matter/main/devices";
import { AutoOffServer } from "../behaviors/auto-off-server.js";
import { BasicInformationServer } from "../behaviors/basic-information-server.js";
import { IdentifyServer } from "../behaviors/identify-server.js";
import { HomeAssistantEntityBehavior } from "../custom-behaviors/home-assistant-entity-behavior.js";

const AutomationDeviceType = OnOffPlugInUnitDevice.with(
  BasicInformationServer,
  IdentifyServer,
  HomeAssistantEntityBehavior,
  AutoOffServer.with("Lighting").set({
    config: {
      turnOn: {
        action: "automation.trigger",
      },
    },
  }),
);

export function AutomationDevice(
  homeAssistantEntity: HomeAssistantEntityBehavior.State,
): EndpointType {
  return AutomationDeviceType.set({ homeAssistantEntity });
}
