import type {
  HomeAssistantDomain,
  HomeAssistantEntityInformation,
} from "@home-assistant-matter-hub/common";
import type { EndpointType } from "@matter/main";
import type { HomeAssistantEntityBehavior } from "../../behaviors/home-assistant-entity-behavior.js";
import { AutomationDevice } from "./automation/index.js";
import { BinarySensorDevice } from "./binary-sensor/index.js";
import { ButtonDevice } from "./button/index.js";
import { ClimateDevice } from "./climate/index.js";
import { CoverDevice } from "./cover/index.js";
import { FanDevice } from "./fan/index.js";
import { HumidifierDevice } from "./humidifier/index.js";
import { InputButtonDevice } from "./input-button/index.js";
import { LightDevice } from "./light/index.js";
import { LockDevice } from "./lock/index.js";
import { MediaPlayerDevice } from "./media-player/index.js";
import { SceneDevice } from "./scene/index.js";
import { ScriptDevice } from "./script/index.js";
import { SensorDevice } from "./sensor/index.js";
import { SwitchDevice } from "./switch/index.js";
import { VacuumDevice } from "./vacuum/index.js";

/**
 * @deprecated
 */
export function createLegacyEndpointType(
  entity: HomeAssistantEntityInformation,
): EndpointType | undefined {
  const domain = entity.entity_id.split(".")[0] as HomeAssistantDomain;
  const factory = deviceCtrs[domain];
  if (!factory) {
    return undefined;
  }
  return factory({ entity });
}

const deviceCtrs: Record<
  HomeAssistantDomain,
  (homeAssistant: HomeAssistantEntityBehavior.State) => EndpointType | undefined
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
