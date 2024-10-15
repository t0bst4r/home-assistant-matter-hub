import { OnOffLightDevice as Device } from "@project-chip/matter.js/devices/OnOffLightDevice";
import { MatterDeviceProps } from "../../matter-device.js";
import { IdentifyServer } from "../../behaviors/identify-server.js";
import { BasicInformationServer } from "../../behaviors/basic-information-server.js";
import { OnOffServer } from "../../behaviors/on-off-server.js";
import { BridgeBasicInformation } from "@home-assistant-matter-hub/common";
import { Endpoint } from "@project-chip/matter.js/endpoint";

export const OnOffLightType = Device.with(
  IdentifyServer,
  BasicInformationServer,
  OnOffServer,
);

export function onOffLightOptions(
  basicInformation: BridgeBasicInformation,
  props: MatterDeviceProps,
): Endpoint.Options<typeof OnOffLightType> {
  return {
    onOff: OnOffServer.createState(props.entity.initialState),
    bridgedDeviceBasicInformation: BasicInformationServer.createState(
      basicInformation,
      props.entity.initialState,
    ),
  };
}
