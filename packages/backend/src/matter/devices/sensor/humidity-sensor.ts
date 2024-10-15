import { BasicInformationServer } from "../../behaviors/basic-information-server.js";
import { IdentifyServer } from "../../behaviors/identify-server.js";
import { BridgeBasicInformation } from "@home-assistant-matter-hub/common";
import { MatterDeviceProps } from "../../matter-device.js";
import { Endpoint } from "@project-chip/matter.js/endpoint";
import { HumiditySensorDevice } from "@project-chip/matter.js/devices/HumiditySensorDevice";
import { HumidityMeasurementServer } from "../../behaviors/humidity-measurement-server.js";

export const HumiditySensorType = HumiditySensorDevice.with(
  BasicInformationServer,
  IdentifyServer,
  HumidityMeasurementServer,
);

export function humiditySensorOptions(
  basicInformation: BridgeBasicInformation,
  props: MatterDeviceProps,
): Endpoint.Options<typeof HumiditySensorType> {
  return {
    bridgedDeviceBasicInformation: BasicInformationServer.createState(
      basicInformation,
      props.entity.initialState,
    ),
    relativeHumidityMeasurement: HumidityMeasurementServer.createState(
      props.entity.initialState,
    ),
  };
}
