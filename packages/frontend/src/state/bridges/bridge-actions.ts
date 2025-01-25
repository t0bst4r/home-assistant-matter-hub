import { createAppThunk } from "../types.ts";
import {
  createBridge as createBridgeApi,
  deleteBridge as deleteBridgeApi,
  fetchBridges,
  updateBridge as updateBridgeApi,
  resetBridge as resetBridgeApi,
} from "../../api/bridges.ts";

export const loadBridges = createAppThunk("bridges/load", fetchBridges);

export const createBridge = createAppThunk("bridges/create", createBridgeApi);

export const deleteBridge = createAppThunk("bridges/delete", deleteBridgeApi);

export const updateBridge = createAppThunk("bridges/update", updateBridgeApi);

export const resetBridge = createAppThunk("bridges/reset", resetBridgeApi);
