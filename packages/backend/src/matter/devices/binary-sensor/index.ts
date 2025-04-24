import {
  type BinarySensorDeviceAttributes,
  BinarySensorDeviceClass,
  type BridgeFeatureFlags,
} from "@home-assistant-matter-hub/common";
import type { EndpointType } from "@matter/main";
import type { HomeAssistantEntityBehavior } from "../../custom-behaviors/home-assistant-entity-behavior.js";
import { ContactSensorType } from "./contact-sensor.js";
import { OccupancySensorType } from "./occupancy-sensor.js";
import { OnOffSensorType } from "./on-off-sensor.js";
import { WaterLeakDetectorType } from "./water-leak-detector.js";

type CombinedType =
  | typeof ContactSensorType
  | typeof OccupancySensorType
  | typeof WaterLeakDetectorType
  | typeof OnOffSensorType;

const deviceClasses: Partial<Record<BinarySensorDeviceClass, CombinedType>> = {
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

export function BinarySensorDevice(
  homeAssistantEntity: HomeAssistantEntityBehavior.State,
  featureFlags?: BridgeFeatureFlags,
): EndpointType {
  const defaultDeviceType =
    featureFlags?.useOnOffSensorAsDefaultForBinarySensors
      ? OnOffSensorType
      : ContactSensorType;

  const attributes = homeAssistantEntity.entity.state
    .attributes as BinarySensorDeviceAttributes;
  const deviceClass = attributes.device_class;
  const type =
    deviceClass && deviceClasses[deviceClass]
      ? deviceClasses[deviceClass]
      : defaultDeviceType;
  return type.set({ homeAssistantEntity });
}
