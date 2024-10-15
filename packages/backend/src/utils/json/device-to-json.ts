import { MatterDevice } from "../../matter/matter-device.js";
import { DeviceData } from "@home-assistant-matter-hub/common";

export function deviceToJson(device: MatterDevice): DeviceData {
  return {
    entityId: device.entity.entity_id,
    endpointCode: device.type.deviceType.toString(16),
    endpointType: device.type.name,
    state: device.state,
  };
}
