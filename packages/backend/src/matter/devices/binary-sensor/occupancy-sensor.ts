import { OccupancySensorDevice } from "@matter/main/devices";
import { BasicInformationServer } from "../../behaviors/basic-information-server.js";
import { IdentifyServer } from "../../behaviors/identify-server.js";
import { OccupancySensingServer } from "../../behaviors/occupancy-sensing-server.js";
import { HomeAssistantEntityBehavior } from "../../custom-behaviors/home-assistant-entity-behavior.js";

export const OccupancySensorType = OccupancySensorDevice.with(
  BasicInformationServer,
  IdentifyServer,
  HomeAssistantEntityBehavior,
  OccupancySensingServer,
);
