import { MatterDevice } from "../matter-device.js";
import {
  HomeAssistantEntityState,
  SensorDeviceAttributes,
  SensorDeviceClass,
} from "@home-assistant-matter-hub/common";
import {
  temperatureSensorConfig,
  TemperatureSensorType,
} from "./sensor/temperature-sensor.js";
import {
  humiditySensorConfig,
  HumiditySensorType,
} from "./sensor/humidity-sensor.js";
import { HomeAssistantBehavior } from "../custom-behaviors/home-assistant-behavior.js";

export function SensorDevice(
  homeAssistant: HomeAssistantBehavior.State,
): MatterDevice | undefined {
  const entity =
    homeAssistant.entity as HomeAssistantEntityState<SensorDeviceAttributes>;
  const deviceClass = entity.attributes.device_class;

  if (deviceClass === SensorDeviceClass.temperature) {
    return new MatterDevice(TemperatureSensorType, homeAssistant, {
      temperatureMeasurement: { config: temperatureSensorConfig },
    });
  } else if (deviceClass === SensorDeviceClass.humidity) {
    return new MatterDevice(HumiditySensorType, homeAssistant, {
      relativeHumidityMeasurement: {
        config: humiditySensorConfig,
      },
    });
  }
  return undefined;
}
