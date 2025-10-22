import type { EndpointType } from "@matter/main";
import { OnOffPlugInUnitDevice } from "@matter/main/devices";
import { BasicInformationServer } from "../../../behaviors/basic-information-server.js";
import { HomeAssistantEntityBehavior } from "../../../behaviors/home-assistant-entity-behavior.js";
import { IdentifyServer } from "../../../behaviors/identify-server.js";
import { OnOffServer } from "../../../behaviors/on-off-server.js";

const SceneOnOffServer = OnOffServer({
  isOn: () => false,
  turnOn: () => ({
    action: "scene.turn_on",
  }),
  turnOff: null,
}).with("Lighting");

const SceneDeviceType = OnOffPlugInUnitDevice.with(
  BasicInformationServer,
  IdentifyServer,
  HomeAssistantEntityBehavior,
  SceneOnOffServer,
);

export function SceneDevice(
  homeAssistantEntity: HomeAssistantEntityBehavior.State,
): EndpointType {
  return SceneDeviceType.set({ homeAssistantEntity });
}
