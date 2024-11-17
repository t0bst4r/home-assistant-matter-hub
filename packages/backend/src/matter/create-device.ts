import {
  BridgeBasicInformation,
  BridgeOverrides,
  CompatibilityMode,
  type HomeAssistantDomain,
  HomeAssistantEntityRegistry,
  HomeAssistantEntityState,
} from "@home-assistant-matter-hub/common";
import { MatterDevice } from "./matter-device.js";
import { LightDevice } from "./devices/light-device.js";
import { SwitchDevice } from "./devices/switch-device.js";
import { LockDevice } from "./devices/lock-device.js";
import { FanDevice } from "./devices/fan-device.js";
import { BinarySensorDevice } from "./devices/binary-sensor-device.js";
import { SensorDevice } from "./devices/sensor-device.js";
import { CoverDevice } from "./devices/cover-device.js";
import { ClimateDevice } from "./devices/climate-device.js";
import { HomeAssistantBehavior } from "./custom-behaviors/home-assistant-behavior.js";
import { HomeAssistantActions } from "../home-assistant/home-assistant-actions.js";
import { MediaPlayerDevice } from "./devices/media-player-device.js";
import { HumidifierDevice } from "./devices/humidifier-device.js";

export function createDevice(
  actions: HomeAssistantActions,
  basicInformation: BridgeBasicInformation,
  overrides: BridgeOverrides,
  compatibility: CompatibilityMode,
  registry: HomeAssistantEntityRegistry,
  entity: HomeAssistantEntityState,
): MatterDevice | undefined {
  const domain = entity.entity_id.split(".")[0] as HomeAssistantDomain;
  const factory = deviceCtrs[domain];
  if (!factory) {
    return undefined;
  }
  const config: object = Object.assign(
    {},
    overrides.domains[domain] ?? {},
    overrides.entities[entity.entity_id] ?? {},
  );
  return factory(
    { actions, basicInformation, registry, entity },
    compatibility,
    config,
  );
}

const deviceCtrs: Record<
  HomeAssistantDomain,
  (
    homeAssistant: HomeAssistantBehavior.State,
    compatibility: CompatibilityMode,
    config: unknown,
  ) => MatterDevice | undefined
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
