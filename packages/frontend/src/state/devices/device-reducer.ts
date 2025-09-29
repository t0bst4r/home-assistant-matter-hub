import type { EndpointData } from "@home-assistant-matter-hub/common";
import { createReducer } from "@reduxjs/toolkit";
import type { AsyncState } from "../utils/async.ts";
import { loadDevices } from "./device-actions.ts";
import type { DeviceState } from "./device-state.ts";

const initialState: DeviceState = {
  byBridge: {},
};

export const deviceReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(loadDevices.pending, (state, action) => {
      state.byBridge[action.meta.arg] = devicesPerBridgeReducer(
        state.byBridge[action.meta.arg],
        action,
      );
    })
    .addCase(loadDevices.rejected, (state, action) => {
      state.byBridge[action.meta.arg] = devicesPerBridgeReducer(
        state.byBridge[action.meta.arg],
        action,
      );
    })
    .addCase(loadDevices.fulfilled, (state, action) => {
      state.byBridge[action.meta.arg] = devicesPerBridgeReducer(
        state.byBridge[action.meta.arg],
        action,
      );
    });
});

const deviceListInitialState: AsyncState<EndpointData> = {
  isInitialized: false,
  isLoading: false,
  content: undefined,
  error: undefined,
};

export const devicesPerBridgeReducer = createReducer(
  deviceListInitialState,
  (builder) => {
    builder
      .addCase(loadDevices.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadDevices.rejected, (state, action) => {
        state.isInitialized = true;
        state.isLoading = false;
        state.content = undefined;
        state.error = action.error;
      })
      .addCase(loadDevices.fulfilled, (state, action) => {
        state.isInitialized = true;
        state.isLoading = false;
        state.content = action.payload;
        state.error = undefined;
      });
  },
);
