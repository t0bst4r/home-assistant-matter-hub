import { MatterDevice, MatterDeviceProps } from "../matter-device.js";
import {
  BridgeBasicInformation,
  HomeAssistantEntityRegistryWithInitialState,
  SensorDeviceAttributes,
  SensorDeviceClass,
} from "@home-assistant-matter-hub/common";
import { EndpointType } from "@project-chip/matter.js/endpoint/type";
import { Endpoint } from "@project-chip/matter.js/endpoint";
import {
  temperatureSensorOptions,
  TemperatureSensorType,
} from "./sensor/temperature-sensor.js";
import {
  humiditySensorOptions,
  HumiditySensorType,
} from "./sensor/humidity-sensor.js";

export function SensorDevice(
  basicInformation: BridgeBasicInformation,
  props: MatterDeviceProps,
): MatterDevice | undefined {
  const entity =
    props.entity as HomeAssistantEntityRegistryWithInitialState<SensorDeviceAttributes>;
  const deviceClass = entity.initialState.attributes.device_class;

  let type: EndpointType | undefined;
  let options: Endpoint.Options | undefined;
  if (deviceClass === SensorDeviceClass.temperature) {
    type = TemperatureSensorType;
    options = temperatureSensorOptions(basicInformation, props);
  } else if (deviceClass === SensorDeviceClass.humidity) {
    type = HumiditySensorType;
    options = humiditySensorOptions(basicInformation, props);
  }
  if (type && options) {
    return new MatterDevice(type, options, props);
  } else {
    return undefined;
  }
}
