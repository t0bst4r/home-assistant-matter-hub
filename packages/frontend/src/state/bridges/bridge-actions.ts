import {
  createBridge as createBridgeApi,
  deleteBridge as deleteBridgeApi,
  fetchBridges,
  resetBridge as resetBridgeApi,
  updateBridge as updateBridgeApi,
} from "../../api/bridges.ts";
import { createAppThunk } from "../types.ts";

export const loadBridges = createAppThunk("bridges/load", fetchBridges);

export const createBridge = createAppThunk("bridges/create", createBridgeApi);

export const deleteBridge = createAppThunk("bridges/delete", deleteBridgeApi);

export const updateBridge = createAppThunk("bridges/update", updateBridgeApi);

export const resetBridge = createAppThunk("bridges/reset", resetBridgeApi);
