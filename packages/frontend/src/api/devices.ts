import { DeviceData } from "@home-assistant-matter-hub/common";

export async function fetchDevices(bridgeId: string, seed?: number) {
  const response = await fetch(
    `api/matter/bridges/${bridgeId}/devices?_s=${seed}`,
  );
  const json = await response.json();
  return json as DeviceData[];
}
