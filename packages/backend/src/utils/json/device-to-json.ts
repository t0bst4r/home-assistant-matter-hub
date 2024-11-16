import { MatterDevice } from "../../matter/matter-device.js";
import { ClusterId, DeviceData } from "@home-assistant-matter-hub/common";
import _ from "lodash";

export function deviceToJson(device: MatterDevice): DeviceData {
  const behaviors = _.pickBy(
    device.behaviors.supported,
    (b) => b.id !== ClusterId.homeAssistant,
  );
  const state = _.mapValues(behaviors, (b) => device.stateOf(b));
  return {
    entityId: device.entityId,
    endpointCode: device.type.deviceType.toString(16),
    endpointType: device.type.name,
    state,
  };
}
