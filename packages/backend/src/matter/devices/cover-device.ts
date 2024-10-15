import { MatterDevice, MatterDeviceProps } from "../matter-device.js";
import { WindowCoveringDevice } from "@project-chip/matter.js/devices/WindowCoveringDevice";
import { BasicInformationServer } from "../behaviors/basic-information-server.js";
import { IdentifyServer } from "../behaviors/identify-server.js";
import {
  WindowCoveringServer,
  WindowCoveringServerConfig,
} from "../behaviors/window-covering-server.js";
import { BridgeBasicInformation } from "@home-assistant-matter-hub/common";
import { Endpoint } from "@project-chip/matter.js/endpoint";

const CoverDeviceType = WindowCoveringDevice.with(
  BasicInformationServer,
  IdentifyServer,
);

export interface CoverDeviceConfig extends WindowCoveringServerConfig {}

export class CoverDevice extends MatterDevice<typeof CoverDeviceType> {
  constructor(
    basicInformation: BridgeBasicInformation,
    props: MatterDeviceProps<CoverDeviceConfig>,
  ) {
    const type = CoverDeviceType.with(WindowCoveringServer(props.deviceConfig));
    const options: Endpoint.Options<typeof type> = {
      bridgedDeviceBasicInformation: BasicInformationServer.createState(
        basicInformation,
        props.entity.initialState,
      ),
      windowCovering: WindowCoveringServer.createState(
        props.entity.initialState,
        props.deviceConfig,
      ),
    };

    super(type, options, props);
  }
}
