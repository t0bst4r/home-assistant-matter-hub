import { DeviceData } from "@home-assistant-matter-hub/common";
import { useMemo } from "react";
import { useAppSelector } from "../../state/hooks.ts";
import { selectDevices } from "../../state/devices/device-selectors.ts";
import { AsyncState } from "../../state/utils/async.ts";

export function useDevices(bridgeId: string): AsyncState<DeviceData[]> {
  const selector = useMemo(() => selectDevices(bridgeId), [bridgeId]);
  return useAppSelector(selector);
}
