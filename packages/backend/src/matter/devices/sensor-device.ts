import { MatterDevice } from "../matter-device.js";
import {
  HomeAssistantEntityState,
  SensorDeviceAttributes,
  SensorDeviceClass,
} from "@home-assistant-matter-hub/common";
import { TemperatureSensorType } from "./sensor/temperature-sensor.js";
import { HumiditySensorType } from "./sensor/humidity-sensor.js";
import { HomeAssistantBehavior } from "../custom-behaviors/home-assistant-behavior.js";

export function SensorDevice(
  homeAssistant: HomeAssistantBehavior.State,
): MatterDevice | undefined {
  const entity =
    homeAssistant.entity as HomeAssistantEntityState<SensorDeviceAttributes>;
  const deviceClass = entity.attributes.device_class;

  const type =
    deviceClass === SensorDeviceClass.temperature
      ? TemperatureSensorType
      : deviceClass === SensorDeviceClass.humidity
        ? HumiditySensorType
        : undefined;

  if (!type) return undefined;

  return new MatterDevice(type, homeAssistant);
}
