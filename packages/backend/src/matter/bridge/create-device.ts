import {
  BridgeFeatureFlags,
  type HomeAssistantDomain,
  HomeAssistantEntityInformation,
} from "@home-assistant-matter-hub/common";
import { LightDevice } from "../devices/light-device.js";
import { SwitchDevice } from "../devices/switch-device.js";
import { LockDevice } from "../devices/lock-device.js";
import { FanDevice } from "../devices/fan-device.js";
import { BinarySensorDevice } from "../devices/binary-sensor-device.js";
import { SensorDevice } from "../devices/sensor-device.js";
import { CoverDevice } from "../devices/cover-device.js";
import { ClimateDevice } from "../devices/climate-device.js";
import { HomeAssistantEntityBehavior } from "../custom-behaviors/home-assistant-entity-behavior.js";
import { MediaPlayerDevice } from "../devices/media-player-device.js";
import { HumidifierDevice } from "../devices/humidifier-device.js";
import { EndpointType } from "@matter/main";

export function createDevice(
  entity: HomeAssistantEntityInformation,
  featureFlags?: BridgeFeatureFlags,
): EndpointType | undefined {
  const domain = entity.entity_id.split(".")[0] as HomeAssistantDomain;
  const factory = deviceCtrs[domain];
  if (!factory) {
    return undefined;
  }
  return factory({ entity }, featureFlags);
}

const deviceCtrs: Record<
  HomeAssistantDomain,
  (
    homeAssistant: HomeAssistantEntityBehavior.State,
    featureFlags?: BridgeFeatureFlags,
  ) => EndpointType | undefined
> = {
  light: LightDevice,
  switch: SwitchDevice,
  lock: LockDevice,
  fan: FanDevice,
  binary_sensor: BinarySensorDevice,
  sensor: SensorDevice,
  cover: CoverDevice,
  climate: ClimateDevice,
  input_boolean: SwitchDevice,
  automation: SwitchDevice,
  script: SwitchDevice,
  scene: SwitchDevice,
  media_player: MediaPlayerDevice,
  humidifier: HumidifierDevice,
};
