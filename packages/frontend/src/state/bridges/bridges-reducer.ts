import { createReducer } from "@reduxjs/toolkit";
import {
  createBridge,
  deleteBridge,
  loadBridges,
  resetBridge,
  updateBridge,
} from "./bridge-actions.ts";
import type { BridgeState } from "./bridge-state.ts";

const initialState: BridgeState = {
  items: { isInitialized: false, isLoading: false },
};

export const bridgesReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(loadBridges.pending, (state) => {
      state.items.isLoading = true;
    })
    .addCase(loadBridges.rejected, (state, action) => {
      state.items.isInitialized = true;
      state.items.isLoading = false;
      state.items.content = undefined;
      state.items.error = action.error;
    })
    .addCase(loadBridges.fulfilled, (state, action) => {
      state.items.isInitialized = true;
      state.items.isLoading = false;
      state.items.content = action.payload;
      state.items.error = undefined;
    })
    .addCase(createBridge.fulfilled, (state, action) => {
      state.items.content?.push(action.payload);
    })
    .addCase(updateBridge.fulfilled, (state, action) => {
      const idx =
        state.items.content?.findIndex((b) => b.id === action.payload.id) ?? -1;
      if (idx !== -1) {
        state.items.content![idx] = action.payload;
      }
    })
    .addCase(resetBridge.fulfilled, (state, action) => {
      const idx =
        state.items.content?.findIndex((b) => b.id === action.payload.id) ?? -1;
      if (idx !== -1) {
        state.items.content![idx] = action.payload;
      }
    })
    .addCase(deleteBridge.fulfilled, (state, action) => {
      if (state.items.content) {
        const idx = state.items.content.findIndex(
          (b) => b.id === action.meta.arg,
        );
        if (idx !== -1) {
          state.items.content.splice(idx, 1);
        }
      }
    });
});
