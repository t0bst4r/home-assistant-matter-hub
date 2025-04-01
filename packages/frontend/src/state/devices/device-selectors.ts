import type { DeviceData } from "@home-assistant-matter-hub/common";
import { type AppState, createAppSelector } from "../types.ts";
import type { AsyncState } from "../utils/async.ts";

export const selectDeviceState = (state: AppState) => state.devices;

export const selectDevices = (bridgeId: string) =>
  createAppSelector(
    [selectDeviceState],
    (bridgeState): AsyncState<DeviceData[]> =>
      bridgeState.byBridge[bridgeId] ?? {
        isInitialized: false,
        isLoading: false,
      },
  );
