import { MatterDevice, MatterDeviceProps } from "../matter-device.js";
import { DoorLockDevice } from "@project-chip/matter.js/devices/DoorLockDevice";
import { BasicInformationServer } from "../behaviors/basic-information-server.js";
import { IdentifyServer } from "../behaviors/identify-server.js";
import { LockServer } from "../behaviors/lock-server.js";
import { BridgeBasicInformation } from "@home-assistant-matter-hub/common";

const LockDeviceType = DoorLockDevice.with(
  BasicInformationServer,
  IdentifyServer,
  LockServer,
);

export class LockDevice extends MatterDevice<typeof LockDeviceType> {
  constructor(
    basicInformation: BridgeBasicInformation,
    props: MatterDeviceProps,
  ) {
    super(
      LockDeviceType,
      {
        doorLock: LockServer.createState(props.entity.initialState),
        bridgedDeviceBasicInformation: BasicInformationServer.createState(
          basicInformation,
          props.entity.initialState,
        ),
      },
      props,
    );
  }
}
