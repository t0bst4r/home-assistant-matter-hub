import { MatterDevice } from "../../matter/matter-device.js";
import { DeviceData } from "@home-assistant-matter-hub/common";
import _ from "lodash";
import { HomeAssistantBehavior } from "../../matter/custom-behaviors/home-assistant-behavior.js";

export function deviceToJson(device: MatterDevice): DeviceData {
  const behaviors = _.pickBy(
    device.behaviors.supported,
    (b) => b.id !== HomeAssistantBehavior.id,
  );
  const state = _.mapValues(behaviors, (b) => device.stateOf(b));
  return {
    entityId: device.entityId,
    endpointCode: device.type.deviceType.toString(16),
    endpointType: device.type.name,
    state,
  };
}
