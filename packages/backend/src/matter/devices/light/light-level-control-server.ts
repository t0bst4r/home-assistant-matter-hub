import {
  LevelControlConfig,
  LevelControlServer,
} from "../../behaviors/level-control-server.js";
import {
  HomeAssistantEntityState,
  LightDeviceAttributes,
} from "@home-assistant-matter-hub/common";

const levelControlConfig: LevelControlConfig = {
  getValue: (state: HomeAssistantEntityState<LightDeviceAttributes>) => {
    const brightness = state.attributes.brightness;
    if (brightness != null) {
      return Math.round((brightness / 255) * 254);
    }
    return null;
  },
  moveToLevel: {
    action: "light.turn_on",
    data: (brightness) => ({
      brightness: Math.round((brightness / 254) * 255),
    }),
  },
  expandMinMaxForValue: true,
};

export const LightLevelControlServer = LevelControlServer.with(
  "OnOff",
  "Lighting",
).set({ config: levelControlConfig });
