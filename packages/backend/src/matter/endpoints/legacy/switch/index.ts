import type { EndpointType } from "@matter/main";
import { OnOffPlugInUnitDevice } from "@matter/main/devices";
import { BasicInformationServer } from "../../../behaviors/basic-information-server.js";
import { HomeAssistantEntityBehavior } from "../../../behaviors/home-assistant-entity-behavior.js";
import { IdentifyServer } from "../../../behaviors/identify-server.js";
import { OnOffServer } from "../../../behaviors/on-off-server.js";

const SwitchOnOffServer = OnOffServer().with("Lighting");

const SwitchEndpointType = OnOffPlugInUnitDevice.with(
  BasicInformationServer,
  IdentifyServer,
  HomeAssistantEntityBehavior,
  SwitchOnOffServer,
);

export function SwitchDevice(
  homeAssistantEntity: HomeAssistantEntityBehavior.State,
): EndpointType {
  return SwitchEndpointType.set({ homeAssistantEntity });
}
