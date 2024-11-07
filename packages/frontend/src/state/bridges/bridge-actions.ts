import { createAppThunk } from "../types.ts";
import {
  createBridge as createBridgeApi,
  deleteBridge as deleteBridgeApi,
  fetchBridges,
  updateBridge as updateBridgeApi,
} from "../../api/bridges.ts";

export const requireBridges = createAppThunk(
  "bridges/require",
  async (_, thunkAPI) => {
    const currentState = thunkAPI.getState().bridges.items;
    if (!currentState.isInitialized && !currentState.isLoading) {
      thunkAPI.dispatch(loadBridges());
    }
  },
);

export const loadBridges = createAppThunk("bridges/load", fetchBridges);

export const createBridge = createAppThunk("bridges/create", createBridgeApi);

export const deleteBridge = createAppThunk("bridges/delete", deleteBridgeApi);

export const updateBridge = createAppThunk("bridges/update", updateBridgeApi);
