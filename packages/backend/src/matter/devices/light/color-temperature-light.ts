import { ColorTemperatureLightDevice as Device } from "@project-chip/matter.js/devices/ColorTemperatureLightDevice";
import { MatterDeviceProps } from "../../matter-device.js";
import { IdentifyServer } from "../../behaviors/identify-server.js";
import { BasicInformationServer } from "../../behaviors/basic-information-server.js";
import { OnOffServer } from "../../behaviors/on-off-server.js";
import { BridgeBasicInformation } from "@home-assistant-matter-hub/common";
import { LightLevelControlServer } from "./light-level-control-server.js";
import { ColorTemperatureControlServer } from "../../behaviors/color-temperature-control-server.js";
import { Endpoint } from "@project-chip/matter.js/endpoint";

export const ColorTemperatureLightType = Device.with(
  IdentifyServer,
  BasicInformationServer,
  OnOffServer,
  LightLevelControlServer,
  ColorTemperatureControlServer,
);

export function colorTemperatureLightOptions(
  basicInformation: BridgeBasicInformation,
  props: MatterDeviceProps,
): Endpoint.Options<typeof ColorTemperatureLightType> {
  return {
    onOff: OnOffServer.createState(props.entity.initialState),
    levelControl: LightLevelControlServer.createState(
      props.entity.initialState,
    ),
    colorControl: ColorTemperatureControlServer.createState(
      props.entity.initialState,
    ),
    bridgedDeviceBasicInformation: BasicInformationServer.createState(
      basicInformation,
      props.entity.initialState,
    ),
  };
}
