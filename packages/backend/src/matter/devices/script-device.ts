import { OnOffPlugInUnitDevice } from "@matter/main/devices";
import { OnOffServer } from "../behaviors/on-off-server.js";
import { BasicInformationServer } from "../behaviors/basic-information-server.js";
import { IdentifyServer } from "../behaviors/identify-server.js";
import { HomeAssistantEntityBehavior } from "../custom-behaviors/home-assistant-entity-behavior.js";
import { EndpointType } from "@matter/main";

const ScriptDeviceType = OnOffPlugInUnitDevice.with(
  BasicInformationServer,
  IdentifyServer,
  HomeAssistantEntityBehavior,
  OnOffServer.set({
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
