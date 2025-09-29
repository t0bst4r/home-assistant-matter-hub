import type { EndpointType } from "@matter/main";
import { OnOffPlugInUnitDevice } from "@matter/main/devices";
import { BasicInformationServer } from "../../../behaviors/basic-information-server.js";
import { HomeAssistantEntityBehavior } from "../../../behaviors/home-assistant-entity-behavior.js";
import { IdentifyServer } from "../../../behaviors/identify-server.js";
import { OnOffServer } from "../../../behaviors/on-off-server.js";
import { HumidifierLevelControlServer } from "./behaviors/humidifier-level-control-server.js";

const HumidifierEndpointType = OnOffPlugInUnitDevice.with(
  BasicInformationServer,
  IdentifyServer,
  HomeAssistantEntityBehavior,
  OnOffServer().with(),
  HumidifierLevelControlServer,
);

export function HumidifierDevice(
  homeAssistantEntity: HomeAssistantEntityBehavior.State,
): EndpointType {
  return HumidifierEndpointType.set({ homeAssistantEntity });
}
