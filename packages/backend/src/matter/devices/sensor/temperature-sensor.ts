import { TemperatureSensorDevice } from "@project-chip/matter.js/devices/TemperatureSensorDevice";
import { BasicInformationServer } from "../../behaviors/basic-information-server.js";
import { IdentifyServer } from "../../behaviors/identify-server.js";
import { TemperatureMeasurementServer } from "../../behaviors/temperature-measurement-server.js";
import { BridgeBasicInformation } from "@home-assistant-matter-hub/common";
import { MatterDeviceProps } from "../../matter-device.js";
import { Endpoint } from "@project-chip/matter.js/endpoint";

export const TemperatureSensorType = TemperatureSensorDevice.with(
  BasicInformationServer,
  IdentifyServer,
  TemperatureMeasurementServer,
);

export function temperatureSensorOptions(
  basicInformation: BridgeBasicInformation,
  props: MatterDeviceProps,
): Endpoint.Options<typeof TemperatureSensorType> {
  return {
    bridgedDeviceBasicInformation: BasicInformationServer.createState(
      basicInformation,
      props.entity.initialState,
    ),
    temperatureMeasurement: TemperatureMeasurementServer.createState(
      props.entity.initialState,
    ),
  };
}
