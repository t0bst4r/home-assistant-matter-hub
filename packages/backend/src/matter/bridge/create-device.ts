import type {
  BridgeFeatureFlags,
  HomeAssistantDomain,
  HomeAssistantEntityInformation,
} from "@home-assistant-matter-hub/common";
import type { EndpointType } from "@matter/main";
import type { HomeAssistantEntityBehavior } from "../custom-behaviors/home-assistant-entity-behavior.js";
import { AutomationDevice } from "../devices/automation/index.js";
import { BinarySensorDevice } from "../devices/binary-sensor/index.js";
import { ButtonDevice } from "../devices/button/index.js";
import { ClimateDevice } from "../devices/climate/index.js";
import { CoverDevice } from "../devices/cover/index.js";
import { FanDevice } from "../devices/fan/index.js";
import { HumidifierDevice } from "../devices/humidifier/index.js";
import { InputButtonDevice } from "../devices/input-button/index.js";
import { LightDevice } from "../devices/light/index.js";
import { LockDevice } from "../devices/lock/index.js";
import { MediaPlayerDevice } from "../devices/media-player/index.js";
import { SceneDevice } from "../devices/scene/index.js";
import { ScriptDevice } from "../devices/script/index.js";
import { SensorDevice } from "../devices/sensor/index.js";
import { SwitchDevice } from "../devices/switch/index.js";
import { VacuumDevice } from "../devices/vacuum/index.js";

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
  vacuum: VacuumDevice,
};
