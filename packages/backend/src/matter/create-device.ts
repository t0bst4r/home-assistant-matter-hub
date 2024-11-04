import {
  BridgeBasicInformation,
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

export function createDevice(
  actions: HomeAssistantActions,
  basicInformation: BridgeBasicInformation,
  registry: HomeAssistantEntityRegistry,
  entity: HomeAssistantEntityState,
): MatterDevice | undefined {
  const domain = entity.entity_id.split(".")[0] as HomeAssistantDomain;
  const factory = deviceCtrs[domain];
  if (!factory) {
    return undefined;
  }
  return factory({ actions, basicInformation, registry, entity });
}

const deviceCtrs: Record<
  HomeAssistantDomain,
  (homeAssistant: HomeAssistantBehavior.State) => MatterDevice | undefined
> = {
  light: (h) => new LightDevice(h),
  switch: (h) => new SwitchDevice(h),
  lock: (h) => new LockDevice(h),
  fan: (h) => new FanDevice(h),
  binary_sensor: (h) => new BinarySensorDevice(h),
  sensor: (h) => SensorDevice(h),
  cover: (h) => new CoverDevice(h),
  climate: (h) => ClimateDevice(h),
  input_boolean: (h) => new SwitchDevice(h),
  automation: (h) => new SwitchDevice(h),
  script: (h) => new SwitchDevice(h),
  scene: (h) => new SwitchDevice(h),
};
