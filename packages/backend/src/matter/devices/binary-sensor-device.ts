import { MatterDevice } from "../matter-device.js";
import {
  BinarySensorDeviceAttributes,
  BinarySensorDeviceClass,
  HomeAssistantEntityState,
} from "@home-assistant-matter-hub/common";
import { HomeAssistantBehavior } from "../custom-behaviors/home-assistant-behavior.js";
import { ContactSensorDevice } from "@project-chip/matter.js/devices/ContactSensorDevice";
import { BasicInformationServer } from "../behaviors/basic-information-server.js";
import { IdentifyServer } from "../behaviors/identify-server.js";
import { BooleanStateServer } from "../behaviors/boolean-state-server.js";
import { OccupancySensorDevice } from "@project-chip/matter.js/devices/OccupancySensorDevice";
import { OccupancySensingServer } from "../behaviors/occupancy-sensing-server.js";

const ContactSensorType = ContactSensorDevice.with(
  BasicInformationServer,
  IdentifyServer,
  HomeAssistantBehavior,
  BooleanStateServer,
);

const OccupancySensorType = OccupancySensorDevice.with(
  BasicInformationServer,
  IdentifyServer,
  HomeAssistantBehavior,
  OccupancySensingServer,
);

const contactTypes: Array<BinarySensorDeviceClass | undefined> = [
  BinarySensorDeviceClass.Door,
  BinarySensorDeviceClass.Window,
  BinarySensorDeviceClass.GarageDoor,
  BinarySensorDeviceClass.Lock,
];
const occupancyTypes: Array<BinarySensorDeviceClass | undefined> = [
  BinarySensorDeviceClass.Occupancy,
  BinarySensorDeviceClass.Motion,
  BinarySensorDeviceClass.Moving,
  BinarySensorDeviceClass.Presence,
];

const defaultDeviceType = ContactSensorType;

export function BinarySensorDevice(homeAssistant: HomeAssistantBehavior.State) {
  const entity =
    homeAssistant.entity as HomeAssistantEntityState<BinarySensorDeviceAttributes>;
  const deviceClass = entity.attributes.device_class;

  if (contactTypes.includes(deviceClass)) {
    return new MatterDevice(ContactSensorType, homeAssistant, {
      booleanState: { inverted: true },
    });
  } else if (occupancyTypes.includes(deviceClass)) {
    return new MatterDevice(OccupancySensorType, homeAssistant);
  } else {
    return new MatterDevice(defaultDeviceType, homeAssistant, {
      booleanState: { inverted: true },
    });
  }
}
