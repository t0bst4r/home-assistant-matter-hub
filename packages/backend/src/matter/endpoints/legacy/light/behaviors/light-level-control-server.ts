import type {
  HomeAssistantEntityState,
  LightDeviceAttributes,
} from "@home-assistant-matter-hub/common";
import {
  type LevelControlConfig,
  LevelControlServer,
} from "../../../../behaviors/level-control-server.js";
import type { Agent } from "@matter/main";
import { BridgeDataProvider } from "../../../../../services/bridges/bridge-data-provider.js";

const config: LevelControlConfig = {
  getValuePercent: (state: HomeAssistantEntityState<LightDeviceAttributes>) => {
    const brightness = state.attributes.brightness;
    if (brightness) {
      return brightness / 255;
    }
    return 0.0;
  },
  moveToLevelPercent: (brightnessPercent) => ({
    action: "light.turn_on",
    data: {
      brightness: Math.round(brightnessPercent * 255),
    },
  }),
  executeIfOff: (_entity: HomeAssistantEntityState, agent: Agent) => {
    const { featureFlags } = agent.env.get(BridgeDataProvider);
    return featureFlags?.alexaLightOptimizations === true;
  },
};

export const LightLevelControlServer = LevelControlServer(config).with([
  "OnOff",
  "Lighting",
]);
