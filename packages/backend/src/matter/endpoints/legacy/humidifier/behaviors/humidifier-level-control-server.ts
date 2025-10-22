import type {
  HomeAssistantEntityState,
  HumidiferDeviceAttributes,
} from "@home-assistant-matter-hub/common";
import { HomeAssistantEntityBehavior } from "../../../../behaviors/home-assistant-entity-behavior.js";
import {
  type LevelControlConfig,
  LevelControlServer,
} from "../../../../behaviors/level-control-server.js";

const config: LevelControlConfig = {
  getValuePercent: (state: HomeAssistantEntityState) => {
    const { min_humidity, max_humidity, humidity } =
      state.attributes as HumidiferDeviceAttributes;
    if (humidity != null) {
      return (humidity - min_humidity) / (max_humidity - min_humidity);
    }
    return null;
  },
  moveToLevelPercent: (humidityPercent, agent) => {
    const { min_humidity, max_humidity } = agent.get(
      HomeAssistantEntityBehavior,
    ).entity.state.attributes as HumidiferDeviceAttributes;
    const humidity =
      (max_humidity - min_humidity) * humidityPercent + min_humidity;
    return {
      action: "humidifier.set_humidity",
      data: { humidity },
    };
  },
};

export const HumidifierLevelControlServer =
  LevelControlServer(config).with("OnOff");
