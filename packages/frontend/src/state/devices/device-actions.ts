import { fetchDevices } from "../../api/devices.ts";
import { createAppThunk } from "../types.ts";

export const loadDevices = createAppThunk("devices/load", fetchDevices);
