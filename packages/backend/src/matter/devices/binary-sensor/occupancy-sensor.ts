import { OccupancySensorDevice } from "@project-chip/matter.js/devices/OccupancySensorDevice";
import { BasicInformationServer } from "../../behaviors/basic-information-server.js";
import { IdentifyServer } from "../../behaviors/identify-server.js";
import { OccupancySensingServer } from "../../behaviors/occupancy-sensing-server.js";
import { HomeAssistantBehavior } from "../../custom-behaviors/home-assistant-behavior.js";

export const OccupancySensorType = OccupancySensorDevice.with(
  BasicInformationServer,
  IdentifyServer,
  HomeAssistantBehavior,
  OccupancySensingServer,
);
