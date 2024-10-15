import { MatterDevice, MatterDeviceProps } from "../matter-device.js";
import { BridgeBasicInformation } from "@home-assistant-matter-hub/common";
import { OnOffPlugInUnitDevice } from "@project-chip/matter.js/devices/OnOffPlugInUnitDevice";
import { OnOffServer } from "../behaviors/on-off-server.js";
import { BasicInformationServer } from "../behaviors/basic-information-server.js";
import { IdentifyServer } from "../behaviors/identify-server.js";

const SwitchEndpointType = OnOffPlugInUnitDevice.with(
  IdentifyServer,
  BasicInformationServer,
  OnOffServer,
);

export class SwitchDevice extends MatterDevice<typeof SwitchEndpointType> {
  constructor(
    basicInformation: BridgeBasicInformation,
    props: MatterDeviceProps,
  ) {
    super(
      SwitchEndpointType,
      {
        onOff: OnOffServer.createState(props.entity.initialState),
        bridgedDeviceBasicInformation: BasicInformationServer.createState(
          basicInformation,
          props.entity.initialState,
        ),
      },
      props,
    );
  }
}
