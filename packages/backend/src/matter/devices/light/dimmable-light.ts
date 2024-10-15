import { DimmableLightDevice as Device } from "@project-chip/matter.js/devices/DimmableLightDevice";
import { MatterDeviceProps } from "../../matter-device.js";
import { IdentifyServer } from "../../behaviors/identify-server.js";
import { BasicInformationServer } from "../../behaviors/basic-information-server.js";
import { OnOffServer } from "../../behaviors/on-off-server.js";
import { BridgeBasicInformation } from "@home-assistant-matter-hub/common";
import { LightLevelControlServer } from "./light-level-control-server.js";
import { Endpoint } from "@project-chip/matter.js/endpoint";

export const DimmableLightType = Device.with(
  IdentifyServer,
  BasicInformationServer,
  OnOffServer,
  LightLevelControlServer,
);

export function dimmableLightOptions(
  basicInformation: BridgeBasicInformation,
  props: MatterDeviceProps,
): Endpoint.Options<typeof DimmableLightType> {
  return {
    onOff: OnOffServer.createState(props.entity.initialState),
    levelControl: LightLevelControlServer.createState(
      props.entity.initialState,
    ),
    bridgedDeviceBasicInformation: BasicInformationServer.createState(
      basicInformation,
      props.entity.initialState,
    ),
  };
}
