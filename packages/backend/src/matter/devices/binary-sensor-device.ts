import { MatterDevice } from "../matter-device.js";
import {
  BinarySensorDeviceAttributes,
  BinarySensorDeviceClass,
  HomeAssistantEntityState,
} from "@home-assistant-matter-hub/common";
import { ContactSensorType } from "./binary-sensor/contact-sensor.js";
import { OccupancySensorType } from "./binary-sensor/occupancy-sensor.js";
import { HomeAssistantBehavior } from "../custom-behaviors/home-assistant-behavior.js";

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

export class BinarySensorDevice extends MatterDevice {
  constructor(homeAssistant: HomeAssistantBehavior.State) {
    const entity =
      homeAssistant.entity as HomeAssistantEntityState<BinarySensorDeviceAttributes>;
    const deviceClass = entity.attributes.device_class;

    const type = contactTypes.includes(deviceClass)
      ? ContactSensorType
      : occupancyTypes.includes(deviceClass)
        ? OccupancySensorType
        : defaultDeviceType;

    super(type, homeAssistant);
  }
}
