import type { EndpointData } from "@home-assistant-matter-hub/common";
import { useMemo } from "react";
import { selectDevices } from "../../state/devices/device-selectors.ts";
import { useAppSelector } from "../../state/hooks.ts";
import type { AsyncState } from "../../state/utils/async.ts";

export function useDevices(bridgeId: string): AsyncState<EndpointData> {
  const selector = useMemo(() => selectDevices(bridgeId), [bridgeId]);
  return useAppSelector(selector);
}
