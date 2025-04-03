import type {
  HomeAssistantEntityState,
  HumidiferDeviceAttributes,
} from "@home-assistant-matter-hub/common";
import type { EndpointType } from "@matter/main";
import { OnOffPlugInUnitDevice } from "@matter/main/devices";
import { BasicInformationServer } from "../behaviors/basic-information-server.js";
import { IdentifyServer } from "../behaviors/identify-server.js";
import {
  type LevelControlConfig,
  LevelControlServer,
} from "../behaviors/level-control-server.js";
import { OnOffServer } from "../behaviors/on-off-server.js";
import { HomeAssistantEntityBehavior } from "../custom-behaviors/home-assistant-entity-behavior.js";

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
  HomeAssistantEntityBehavior,
  OnOffServer.with("Lighting"),
  LevelControlServer.with("OnOff", "Lighting").set({
    config: humidifierLevelConfig,
  }),
);

export function HumidifierDevice(
  homeAssistantEntity: HomeAssistantEntityBehavior.State,
): EndpointType {
  return HumidifierEndpointType.set({ homeAssistantEntity });
}
