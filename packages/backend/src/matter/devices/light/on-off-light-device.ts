import { OnOffLightDevice as Device } from "@matter/main/devices";
import { BasicInformationServer } from "../../behaviors/basic-information-server.js";
import { IdentifyServer } from "../../behaviors/identify-server.js";
import { HomeAssistantEntityBehavior } from "../../custom-behaviors/home-assistant-entity-behavior.js";
import { LightOnOffServer } from "./light-on-off-server.js";

export const OnOffLightType = Device.with(
  IdentifyServer,
  BasicInformationServer,
  HomeAssistantEntityBehavior,
  LightOnOffServer,
);
