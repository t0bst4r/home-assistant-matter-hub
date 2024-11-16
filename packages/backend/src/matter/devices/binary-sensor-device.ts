import { MatterDevice } from "../matter-device.js";
import {
  BinarySensorDeviceAttributes,
  BinarySensorDeviceClass,
  HomeAssistantEntityState,
} from "@home-assistant-matter-hub/common";
import { HomeAssistantBehavior } from "../custom-behaviors/home-assistant-behavior.js";
import {
  ContactSensorDevice,
  OccupancySensorDevice,
  WaterLeakDetectorDevice,
} from "@matter/main/devices";
import { BasicInformationServer } from "../behaviors/basic-information-server.js";
import { IdentifyServer } from "../behaviors/identify-server.js";
import { BooleanStateServer } from "../behaviors/boolean-state-server.js";
import { OccupancySensingServer } from "../behaviors/occupancy-sensing-server.js";
import { EndpointType } from "@matter/main";

const ContactSensorType = ContactSensorDevice.with(
  BasicInformationServer,
  IdentifyServer,
  HomeAssistantBehavior,
  BooleanStateServer.set({ config: { inverted: true } }),
);
const OccupancySensorType = OccupancySensorDevice.with(
  BasicInformationServer,
  IdentifyServer,
  HomeAssistantBehavior,
  OccupancySensingServer,
);
const WaterLeakDetectorType = WaterLeakDetectorDevice.with(
  BasicInformationServer,
  IdentifyServer,
  HomeAssistantBehavior,
  BooleanStateServer,
);

const deviceClasses: Partial<Record<BinarySensorDeviceClass, EndpointType>> = {
  [BinarySensorDeviceClass.Occupancy]: OccupancySensorType,
  [BinarySensorDeviceClass.Motion]: OccupancySensorType,
  [BinarySensorDeviceClass.Moving]: OccupancySensorType,
  [BinarySensorDeviceClass.Presence]: OccupancySensorType,

  [BinarySensorDeviceClass.Door]: ContactSensorType,
  [BinarySensorDeviceClass.Window]: ContactSensorType,
  [BinarySensorDeviceClass.GarageDoor]: ContactSensorType,
  [BinarySensorDeviceClass.Lock]: ContactSensorType,

  [BinarySensorDeviceClass.Moisture]: WaterLeakDetectorType,
};

const defaultDeviceType = ContactSensorType;

export function BinarySensorDevice(homeAssistant: HomeAssistantBehavior.State) {
  const entity =
    homeAssistant.entity as HomeAssistantEntityState<BinarySensorDeviceAttributes>;
  const deviceClass = entity.attributes.device_class;
  const type =
    deviceClass && deviceClasses[deviceClass]
      ? deviceClasses[deviceClass]
      : defaultDeviceType;
  return new MatterDevice(type, homeAssistant);
}
