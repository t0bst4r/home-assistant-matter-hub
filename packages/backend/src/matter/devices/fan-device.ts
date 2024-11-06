import { MatterDevice } from "../matter-device.js";
import {
  FanDeviceAttributes,
  HomeAssistantEntityState,
} from "@home-assistant-matter-hub/common";
import { OnOffPlugInUnitDevice } from "@project-chip/matter.js/devices/OnOffPlugInUnitDevice";
import { OnOffServer } from "../behaviors/on-off-server.js";
import { BasicInformationServer } from "../behaviors/basic-information-server.js";
import { IdentifyServer } from "../behaviors/identify-server.js";
import {
  LevelControlConfig,
  LevelControlServer,
} from "../behaviors/level-control-server.js";
import { HomeAssistantBehavior } from "../custom-behaviors/home-assistant-behavior.js";

const fanLevelConfig: LevelControlConfig = {
  getValue: (state: HomeAssistantEntityState<FanDeviceAttributes>) => {
    if (state.attributes.percentage != null) {
      return (state.attributes.percentage / 100) * 254;
    }
    return 0;
  },
  getMinValue: () => 0,
  getMaxValue: () => 254,
  moveToLevel: {
    action: "fan.set_percentage",
    data: (value) => ({ percentage: (value / 254) * 100 }),
  },
};

const FanDeviceType = OnOffPlugInUnitDevice.with(
  IdentifyServer,
  BasicInformationServer,
  OnOffServer,
  HomeAssistantBehavior,
  LevelControlServer,
);

export function FanDevice(homeAssistant: HomeAssistantBehavior.State) {
  return new MatterDevice(FanDeviceType, homeAssistant, {
    levelControl: { config: fanLevelConfig },
  });
}
