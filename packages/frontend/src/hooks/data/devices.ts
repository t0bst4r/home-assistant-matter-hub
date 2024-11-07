import { ApiResponse, useApi } from "./api.ts";
import { DeviceData } from "@home-assistant-matter-hub/common";
import { useCallback } from "react";

export function useDevices(
  bridgeId: string,
  seed?: number,
): ApiResponse<DeviceData[]> {
  const cb = useCallback(
    () =>
      fetch(`/api/matter/bridges/${bridgeId}/devices?_s=${seed}`).then(
        (res) => res.json() as Promise<DeviceData[]>,
      ),
    [bridgeId, seed],
  );
  return useApi(cb);
}
