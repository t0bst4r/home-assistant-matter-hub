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
import { InputButtonDevice } from "../devices/input-button-device.js";
import { ButtonDevice } from "../devices/button-device.js";
import { AutomationDevice } from "../devices/automation-device.js";
import { ScriptDevice } from "../devices/script-device.js";
import { SceneDevice } from "../devices/scene-device.js";

export function createDevice(
  lockKey: string,
  entity: HomeAssistantEntityInformation,
  featureFlags?: BridgeFeatureFlags,
): EndpointType | undefined {
  const domain = entity.entity_id.split(".")[0] as HomeAssistantDomain;
  const factory = deviceCtrs[domain];
  if (!factory) {
    return undefined;
  }
  return factory({ entity, lockKey }, featureFlags);
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
  input_button: InputButtonDevice,
  button: ButtonDevice,
  automation: AutomationDevice,
  script: ScriptDevice,
  scene: SceneDevice,
  media_player: MediaPlayerDevice,
  humidifier: HumidifierDevice,
};
