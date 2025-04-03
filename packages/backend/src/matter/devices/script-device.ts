import type { EndpointType } from "@matter/main";
import { OnOffPlugInUnitDevice } from "@matter/main/devices";
import { BasicInformationServer } from "../behaviors/basic-information-server.js";
import { IdentifyServer } from "../behaviors/identify-server.js";
import { OnOffServer } from "../behaviors/on-off-server.js";
import { HomeAssistantEntityBehavior } from "../custom-behaviors/home-assistant-entity-behavior.js";

const ScriptDeviceType = OnOffPlugInUnitDevice.with(
  BasicInformationServer,
  IdentifyServer,
  HomeAssistantEntityBehavior,
  OnOffServer.with("Lighting").set({
    config: {
      turnOn: {
        action: "script.turn_on",
      },
      turnOff: {
        action: "script.turn_off",
      },
    },
  }),
);

export function ScriptDevice(
  homeAssistantEntity: HomeAssistantEntityBehavior.State,
): EndpointType {
  return ScriptDeviceType.set({ homeAssistantEntity });
}
