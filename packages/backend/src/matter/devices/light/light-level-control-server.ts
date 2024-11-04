import {
  LevelControlConfig,
  LevelControlServer,
} from "../../behaviors/level-control-server.js";
import {
  HomeAssistantEntityState,
  LightDeviceAttributes,
} from "@home-assistant-matter-hub/common";

const lightLevelControlConfig: LevelControlConfig = {
  getValue: (state: HomeAssistantEntityState<LightDeviceAttributes>) => {
    const brightness = state.attributes.brightness;
    if (brightness != null) {
      return (brightness / 255) * 254;
    }
    return 0;
  },
  moveToLevel: {
    action: "light.turn_on",
    data: (brightness) => ({ brightness: (brightness / 254) * 255 }),
  },
};
export const LightLevelControlServer = LevelControlServer(
  lightLevelControlConfig,
);
