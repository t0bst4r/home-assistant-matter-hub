import type { DeviceData } from "@home-assistant-matter-hub/common";
import type { AsyncState } from "../utils/async.ts";

export interface DeviceState {
  byBridge: { [bridge: string]: AsyncState<DeviceData[]> | undefined };
}
