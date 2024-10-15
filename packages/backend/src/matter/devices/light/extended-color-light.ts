import { ExtendedColorLightDevice as Device } from "@project-chip/matter.js/devices/ExtendedColorLightDevice";
import { MatterDeviceProps } from "../../matter-device.js";
import { IdentifyServer } from "../../behaviors/identify-server.js";
import { BasicInformationServer } from "../../behaviors/basic-information-server.js";
import { OnOffServer } from "../../behaviors/on-off-server.js";
import { BridgeBasicInformation } from "@home-assistant-matter-hub/common";
import { LightLevelControlServer } from "./light-level-control-server.js";
import { ExtendedColorControlServer } from "../../behaviors/extended-color-control-server.js";
import { Endpoint } from "@project-chip/matter.js/endpoint";

export const ExtendedColorLightType = Device.with(
  IdentifyServer,
  BasicInformationServer,
  OnOffServer,
  LightLevelControlServer,
  ExtendedColorControlServer,
);

export function extendedColorLightOptions(
  basicInformation: BridgeBasicInformation,
  props: MatterDeviceProps,
): Endpoint.Options<typeof ExtendedColorLightType> {
  return {
    onOff: OnOffServer.createState(props.entity.initialState),
    levelControl: LightLevelControlServer.createState(
      props.entity.initialState,
    ),
    colorControl: ExtendedColorControlServer.createState(
      props.entity.initialState,
    ),
    bridgedDeviceBasicInformation: BasicInformationServer.createState(
      basicInformation,
      props.entity.initialState,
    ),
  };
}
