import type { EndpointData } from "@home-assistant-matter-hub/common";

export async function fetchDevices(bridgeId: string) {
  const response = await fetch(`api/matter/bridges/${bridgeId}/devices`);
  const json = await response.json();
  return json as EndpointData;
}
