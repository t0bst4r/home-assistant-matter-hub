import { createAppThunk } from "../types.ts";
import { fetchDevices } from "../../api/devices.ts";

export const loadDevices = createAppThunk("devices/load", fetchDevices);
