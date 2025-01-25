import { DeviceData } from "@home-assistant-matter-hub/common";
import { AsyncState } from "../utils/async.ts";

export interface DeviceState {
  byBridge: { [bridge: string]: AsyncState<DeviceData[]> | undefined };
}
