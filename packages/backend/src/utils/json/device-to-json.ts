import type { DeviceData } from "@home-assistant-matter-hub/common";
import type { Endpoint } from "@matter/main";
import _ from "lodash";
import { HomeAssistantEntityBehavior } from "../../matter/custom-behaviors/home-assistant-entity-behavior.js";

export function deviceToJson(device: Endpoint): DeviceData {
  const behaviors = device.behaviors.supported;
  const entity = device.stateOf(HomeAssistantEntityBehavior).entity;
  const state = _.mapValues(behaviors, (b) => device.stateOf(b));
  return {
    entityId: entity.entity_id,
    endpointCode: device.type.deviceType.toString(16),
    endpointType: device.type.name,
    state,
  };
}
