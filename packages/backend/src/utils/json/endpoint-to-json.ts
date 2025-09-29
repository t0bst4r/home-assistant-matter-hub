import type { EndpointData } from "@home-assistant-matter-hub/common";
import type { Endpoint } from "@matter/main";

export function endpointToJson(
  endpoint: Endpoint,
  parentId?: string,
): EndpointData {
  const globalId = [parentId, endpoint.id].filter((i) => !!i).join(".");
  return {
    id: {
      global: globalId,
      local: endpoint.id,
    },
    type: {
      name: endpoint.type.name,
      id: `0x${endpoint.type.deviceType.toString(16).padStart(4, "0")}`,
    },
    endpoint: endpoint.number,
    state: endpoint.state,
    parts: endpoint.parts.map((p) => endpointToJson(p, globalId)),
  };
}
