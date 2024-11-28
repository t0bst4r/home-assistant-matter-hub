import { OnOffPlugInUnitDevice } from "@matter/main/devices";
import { OnOffConfig, OnOffServer } from "../behaviors/on-off-server.js";
import { BasicInformationServer } from "../behaviors/basic-information-server.js";
import { IdentifyServer } from "../behaviors/identify-server.js";
import { HomeAssistantEntityBehavior } from "../custom-behaviors/home-assistant-entity-behavior.js";
import { EndpointType } from "@matter/main";

const sceneOnOffConfig: OnOffConfig = {
  isOn: () => false,
};

const SceneEndpointType = OnOffPlugInUnitDevice.with(
  BasicInformationServer,
  IdentifyServer,
  HomeAssistantEntityBehavior,
  OnOffServer.set({ config: sceneOnOffConfig }),
);

export function SceneDevice(
  homeAssistantEntity: HomeAssistantEntityBehavior.State,
): EndpointType {
  return SceneEndpointType.set({ homeAssistantEntity });
}
