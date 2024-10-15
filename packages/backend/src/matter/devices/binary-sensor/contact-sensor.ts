import { MatterDeviceProps } from "../../matter-device.js";
import { ContactSensorDevice } from "@project-chip/matter.js/devices/ContactSensorDevice";
import { BasicInformationServer } from "../../behaviors/basic-information-server.js";
import { IdentifyServer } from "../../behaviors/identify-server.js";
import { BridgeBasicInformation } from "@home-assistant-matter-hub/common";
import { Endpoint } from "@project-chip/matter.js/endpoint";
import { BooleanStateServer } from "../../behaviors/boolean-state-server.js";

export const ContactSensorType = ContactSensorDevice.with(
  BasicInformationServer,
  IdentifyServer,
  BooleanStateServer(true),
);

export function contactSensorOptions(
  basicInformation: BridgeBasicInformation,
  props: MatterDeviceProps,
): Endpoint.Options<typeof ContactSensorType> {
  return {
    booleanState: BooleanStateServer.createState(
      true,
      props.entity.initialState,
    ),
    bridgedDeviceBasicInformation: BasicInformationServer.createState(
      basicInformation,
      props.entity.initialState,
    ),
  };
}
