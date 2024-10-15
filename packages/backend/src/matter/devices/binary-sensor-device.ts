import { MatterDevice, MatterDeviceProps } from "../matter-device.js";
import {
  BinarySensorDeviceAttributes,
  BinarySensorDeviceClass,
  BridgeBasicInformation,
  HomeAssistantEntityRegistryWithInitialState,
} from "@home-assistant-matter-hub/common";
import { EndpointType } from "@project-chip/matter.js/endpoint/type";
import { Endpoint } from "@project-chip/matter.js/endpoint";
import {
  contactSensorOptions,
  ContactSensorType,
} from "./binary-sensor/contact-sensor.js";
import {
  occupancySensorOptions,
  OccupancySensorType,
} from "./binary-sensor/occupancy-sensor.js";

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
const defaultDeviceOptions = contactSensorOptions;

export class BinarySensorDevice extends MatterDevice {
  constructor(
    basicInformation: BridgeBasicInformation,
    props: MatterDeviceProps,
  ) {
    const entity =
      props.entity as HomeAssistantEntityRegistryWithInitialState<BinarySensorDeviceAttributes>;
    const deviceClass = entity.initialState.attributes.device_class;

    let type: EndpointType, options: Endpoint.Options;
    if (contactTypes.includes(deviceClass)) {
      type = ContactSensorType;
      options = contactSensorOptions(basicInformation, props);
    } else if (occupancyTypes.includes(deviceClass)) {
      type = OccupancySensorType;
      options = occupancySensorOptions(basicInformation, props);
    } else {
      type = defaultDeviceType;
      options = defaultDeviceOptions(basicInformation, props);
    }
    super(type, options, props);
  }
}
