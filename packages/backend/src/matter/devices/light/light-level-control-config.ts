import { LevelControlConfig } from "../../behaviors/level-control-server.js";
import {
  HomeAssistantEntityState,
  LightDeviceAttributes,
} from "@home-assistant-matter-hub/common";

export const lightLevelControlConfig: LevelControlConfig = {
  getValue: (state: HomeAssistantEntityState<LightDeviceAttributes>) => {
    const brightness = state.attributes.brightness;
    if (brightness != null) {
      return (brightness / 255) * 254;
    }
    return null;
  },
  moveToLevel: {
    action: "light.turn_on",
    data: (brightness) => ({ brightness: (brightness / 254) * 255 }),
  },
};
