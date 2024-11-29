import { ApiResponse, useApi } from "./api.ts";
import { DeviceData } from "@home-assistant-matter-hub/common";
import { useCallback } from "react";
import { fetchDevices } from "../../api/devices.ts";

export function useDevices(
  bridgeId: string,
  seed?: number,
): ApiResponse<DeviceData[]> {
  const cb = useCallback(() => fetchDevices(bridgeId, seed), [bridgeId, seed]);
  return useApi(cb);
}
