import { AppState, createAppSelector } from "../types.ts";
import { AsyncState } from "../utils/async.ts";
import { DeviceData } from "@home-assistant-matter-hub/common";

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
