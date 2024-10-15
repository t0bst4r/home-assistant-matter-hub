import { OccupancySensorDevice } from "@project-chip/matter.js/devices/OccupancySensorDevice";
import { BasicInformationServer } from "../../behaviors/basic-information-server.js";
import { IdentifyServer } from "../../behaviors/identify-server.js";
import { BridgeBasicInformation } from "@home-assistant-matter-hub/common";
import { MatterDeviceProps } from "../../matter-device.js";
import { Endpoint } from "@project-chip/matter.js/endpoint";
import { OccupancySensingServer } from "../../behaviors/occupancy-sensing-server.js";

export const OccupancySensorType = OccupancySensorDevice.with(
  BasicInformationServer,
  IdentifyServer,
  OccupancySensingServer,
);

export function occupancySensorOptions(
  basicInformation: BridgeBasicInformation,
  props: MatterDeviceProps,
): Endpoint.Options<typeof OccupancySensorType> {
  return {
    occupancySensing: OccupancySensingServer.createState(
      props.entity.initialState,
    ),
    bridgedDeviceBasicInformation: BasicInformationServer.createState(
      basicInformation,
      props.entity.initialState,
    ),
  };
}
