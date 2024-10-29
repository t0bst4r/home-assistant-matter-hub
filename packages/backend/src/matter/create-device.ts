import {
  BridgeBasicInformation,
  type HomeAssistantDomain,
  HomeAssistantEntityRegistryWithInitialState,
} from "@home-assistant-matter-hub/common";
import { createChildLogger } from "../logging/create-child-logger.js";
import { MatterDevice, MatterDeviceProps } from "./matter-device.js";
import { LightDevice } from "./devices/light-device.js";
import { SwitchDevice } from "./devices/switch-device.js";
import { LockDevice } from "./devices/lock-device.js";
import { FanDevice } from "./devices/fan-device.js";
import { BinarySensorDevice } from "./devices/binary-sensor-device.js";
import { SensorDevice } from "./devices/sensor-device.js";
import { CoverDevice, CoverDeviceConfig } from "./devices/cover-device.js";
import { ClimateDevice } from "./devices/climate-device.js";
import { Logger } from "winston";
import { HomeAssistantClient } from "../home-assistant/home-assistant-client.js";

export function createDevice(
  basicInformation: BridgeBasicInformation,
  entity: HomeAssistantEntityRegistryWithInitialState,
  logger: Logger,
  homeAssistant: HomeAssistantClient,
): MatterDevice | undefined {
  const domain = entity.entity_id.split(".")[0] as HomeAssistantDomain;
  const factory = deviceCtrs[domain];
  if (!factory) {
    return undefined;
  }
  return factory(basicInformation, {
    logger: createChildLogger(logger, entity.entity_id),
    actions: homeAssistant,
    entity,
  });
}

const deviceCtrs: Record<
  HomeAssistantDomain,
  (
    basicInformation: BridgeBasicInformation,
    props: MatterDeviceProps,
  ) => MatterDevice | undefined
> = {
  light: (b, p) => new LightDevice(b, p),
  switch: (b, p) => new SwitchDevice(b, p),
  lock: (b, p) => new LockDevice(b, p),
  fan: (b, p) => new FanDevice(b, p),
  binary_sensor: (b, p) => new BinarySensorDevice(b, p),
  sensor: (b, p) => SensorDevice(b, p),
  cover: (b, p) =>
    new CoverDevice(b, p as MatterDeviceProps<CoverDeviceConfig>),
  climate: (b, p) => new ClimateDevice(b, p),
  input_boolean: (b, p) => new SwitchDevice(b, p),
  automation: (b, p) => new SwitchDevice(b, p),
  script: (b, p) => new SwitchDevice(b, p),
  scene: (b, p) => new SwitchDevice(b, p),
};
