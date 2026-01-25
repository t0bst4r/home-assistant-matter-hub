import {
  type FanDeviceAttributes,
  FanDeviceDirection,
  type HomeAssistantEntityState,
} from "@home-assistant-matter-hub/common";
import { FanControl } from "@matter/main/clusters";
import {
  FanControlServer,
  type FanControlServerConfig,
} from "../../../../behaviors/fan-control-server.js";

const attributes = (e: HomeAssistantEntityState) =>
  e.attributes as FanDeviceAttributes;

const fanControlConfig: FanControlServerConfig = {
  getPercentage: (state) =>
    state.state === "off" ? 0 : attributes(state).percentage,
  getStepSize: (state) => attributes(state).percentage_step,
  getAirflowDirection: (state) =>
    attributes(state).current_direction === FanDeviceDirection.FORWARD
      ? FanControl.AirflowDirection.Forward
      : attributes(state).current_direction === FanDeviceDirection.REVERSE
        ? FanControl.AirflowDirection.Reverse
        : FanControl.AirflowDirection.Forward,
  isInAutoMode: (state) => attributes(state).preset_mode === "Auto",

  turnOff: () => ({ action: "fan.turn_off" }),
  turnOn: (percentage) => ({ action: "fan.turn_on", data: { percentage } }),
  setAutoMode: () => ({ action: "fan.turn_on", data: { preset_mode: "Auto" } }),
  setAirflowDirection: (direction) => ({
    action: "fan.set_direction",
    data: {
      direction:
        direction === FanControl.AirflowDirection.Forward
          ? FanDeviceDirection.FORWARD
          : FanDeviceDirection.REVERSE,
    },
  }),
};

export const FanFanControlServer = FanControlServer(fanControlConfig);
