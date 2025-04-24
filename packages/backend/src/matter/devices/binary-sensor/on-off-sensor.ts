import { OnOffSensorDevice } from "@matter/main/devices";
import { BasicInformationServer } from "../../behaviors/basic-information-server.js";
import { IdentifyServer } from "../../behaviors/identify-server.js";
import { OnOffServer } from "../../behaviors/on-off-server.js";
import { HomeAssistantEntityBehavior } from "../../custom-behaviors/home-assistant-entity-behavior.js";

const OnOffSensorServer = OnOffServer({
  turnOn: null,
  turnOff: null,
}).with();

export const OnOffSensorType = OnOffSensorDevice.with(
  BasicInformationServer,
  IdentifyServer,
  HomeAssistantEntityBehavior,
  OnOffSensorServer,
);
