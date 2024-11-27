import { ClusterId, DeviceData } from "@home-assistant-matter-hub/common";
import _ from "lodash";
import { Endpoint } from "@matter/main";
import { HomeAssistantEntityBehavior } from "../../matter/custom-behaviors/home-assistant-entity-behavior.js";

export function deviceToJson(device: Endpoint): DeviceData {
  const behaviors = _.pickBy(
    device.behaviors.supported,
    (b) => b.id in ClusterId,
  );
  const entity = device.stateOf(HomeAssistantEntityBehavior).entity;
  const state = _.mapValues(behaviors, (b) => device.stateOf(b));
  return {
    entityId: entity.entity_id,
    endpointCode: device.type.deviceType.toString(16),
    endpointType: device.type.name,
    state,
  };
}
