import { MatterDevice } from "../matter-device.js";
import { OnOffPlugInUnitDevice } from "@matter/main/devices";
import { OnOffServer } from "../behaviors/on-off-server.js";
import { BasicInformationServer } from "../behaviors/basic-information-server.js";
import { IdentifyServer } from "../behaviors/identify-server.js";
import { HomeAssistantBehavior } from "../custom-behaviors/home-assistant-behavior.js";
import {
  LevelControlConfig,
  LevelControlServer,
} from "../behaviors/level-control-server.js";
import {
  HomeAssistantEntityState,
  HumidiferDeviceAttributes,
} from "@home-assistant-matter-hub/common";

const humidifierLevelConfig: LevelControlConfig = {
  getValue: (state: HomeAssistantEntityState) => {
    const attributes = state.attributes as HumidiferDeviceAttributes;
    return attributes.humidity ?? null;
  },
  getMinValue: (state: HomeAssistantEntityState) => {
    const attributes = state.attributes as HumidiferDeviceAttributes;
    return attributes.min_humidity ?? undefined;
  },
  getMaxValue: (state: HomeAssistantEntityState) => {
    const attributes = state.attributes as HumidiferDeviceAttributes;
    return attributes.max_humidity ?? undefined;
  },
  moveToLevel: {
    action: "humidifier.set_humidity",
    data: (humidity) => ({ humidity }),
  },
};

const HumidifierEndpointType = OnOffPlugInUnitDevice.with(
  BasicInformationServer,
  IdentifyServer,
  HomeAssistantBehavior,
  OnOffServer,
  LevelControlServer,
);

export function HumidifierDevice(homeAssistant: HomeAssistantBehavior.State) {
  return new MatterDevice(HumidifierEndpointType, homeAssistant, {
    levelControl: {
      config: humidifierLevelConfig,
    },
  });
}
