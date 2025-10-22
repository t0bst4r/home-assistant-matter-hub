import type { EndpointType } from "@matter/main";
import { OnOffPlugInUnitDevice } from "@matter/main/devices";
import { BasicInformationServer } from "../../../behaviors/basic-information-server.js";
import { HomeAssistantEntityBehavior } from "../../../behaviors/home-assistant-entity-behavior.js";
import { IdentifyServer } from "../../../behaviors/identify-server.js";
import { OnOffServer } from "../../../behaviors/on-off-server.js";

const ScriptOnOffServer = OnOffServer({
  turnOn: () => ({
    action: "script.turn_on",
  }),
  turnOff: () => ({
    action: "script.turn_off",
  }),
}).with("Lighting");

const ScriptDeviceType = OnOffPlugInUnitDevice.with(
  BasicInformationServer,
  IdentifyServer,
  HomeAssistantEntityBehavior,
  ScriptOnOffServer,
);

export function ScriptDevice(
  homeAssistantEntity: HomeAssistantEntityBehavior.State,
): EndpointType {
  return ScriptDeviceType.set({ homeAssistantEntity });
}
