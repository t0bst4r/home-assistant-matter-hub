import { describe, expect, it, vi } from "vitest";
import {
  BinarySensorDeviceAttributes,
  BinarySensorDeviceClass,
  BridgeBasicInformation,
  ClimateDeviceAttributes,
  ClimateHvacMode,
  ClusterId,
  CoverDeviceAttributes,
  FanDeviceAttributes,
  HomeAssistantDomain,
  HomeAssistantEntityRegistry,
  HomeAssistantEntityState,
  LightDeviceAttributes,
  LightDeviceColorMode,
  SensorDeviceAttributes,
  SensorDeviceClass,
} from "@home-assistant-matter-hub/common";
import { createDevice } from "./create-device.js";
import { MatterDevice } from "./matter-device.js";
import { deviceToJson } from "../utils/json/device-to-json.js";
import _ from "lodash";
import { HomeAssistantActions } from "../home-assistant/home-assistant-actions.js";

const testEntities: Record<
  HomeAssistantDomain,
  [HomeAssistantEntityRegistry, HomeAssistantEntityState][]
> = {
  [HomeAssistantDomain.binary_sensor]: [
    createEntity<BinarySensorDeviceAttributes>("binary_sensor.bs1", "on", {
      device_class: BinarySensorDeviceClass.GarageDoor,
    }),
    createEntity<BinarySensorDeviceAttributes>("binary_sensor.bs2", "on", {
      device_class: BinarySensorDeviceClass.Occupancy,
    }),
  ],
  [HomeAssistantDomain.climate]: [
    createEntity<ClimateDeviceAttributes>("climate.cl1", "on", {
      hvac_modes: [ClimateHvacMode.heat],
    }),
    createEntity<ClimateDeviceAttributes>("climate.cl2", "on", {
      hvac_modes: [ClimateHvacMode.cool],
    }),
    createEntity<ClimateDeviceAttributes>("climate.cl3", "on", {
      hvac_modes: [ClimateHvacMode.heat_cool],
    }),
    createEntity<ClimateDeviceAttributes>("climate.cl4", "on", {
      hvac_modes: [ClimateHvacMode.heat, ClimateHvacMode.cool],
    }),
  ],
  [HomeAssistantDomain.cover]: [
    createEntity<CoverDeviceAttributes>("cover.co1", "on", {}),
  ],
  [HomeAssistantDomain.fan]: [
    createEntity<FanDeviceAttributes>("fan.f1", "on"),
  ],
  [HomeAssistantDomain.light]: [
    createEntity<LightDeviceAttributes>("light.l1", "on"),
    createEntity<LightDeviceAttributes>("light.l2", "on", {
      supported_color_modes: [LightDeviceColorMode.BRIGHTNESS],
    }),
    createEntity<LightDeviceAttributes>("light.l3", "on", {
      supported_color_modes: [
        LightDeviceColorMode.BRIGHTNESS,
        LightDeviceColorMode.HS,
      ],
    }),
    createEntity<LightDeviceAttributes>("light.l4", "on", {
      supported_color_modes: [
        LightDeviceColorMode.BRIGHTNESS,
        LightDeviceColorMode.COLOR_TEMP,
      ],
    }),
    createEntity<LightDeviceAttributes>("light.l5", "on", {
      supported_color_modes: [
        LightDeviceColorMode.BRIGHTNESS,
        LightDeviceColorMode.HS,
        LightDeviceColorMode.COLOR_TEMP,
      ],
    }),
  ],
  [HomeAssistantDomain.lock]: [createEntity("lock.l1", "locked")],
  [HomeAssistantDomain.sensor]: [
    createEntity<SensorDeviceAttributes>("sensor.s1", "on", {
      device_class: SensorDeviceClass.temperature,
    }),
    createEntity<SensorDeviceAttributes>("sensor.s2", "on", {
      device_class: SensorDeviceClass.humidity,
    }),
  ],
  [HomeAssistantDomain.switch]: [createEntity("switch.sw1", "on")],
  [HomeAssistantDomain.automation]: [
    createEntity("automation.automation1", "on"),
  ],
  [HomeAssistantDomain.script]: [createEntity("script.script1", "on")],
  [HomeAssistantDomain.scene]: [createEntity("scene.scene1", "on")],
  [HomeAssistantDomain.input_boolean]: [
    createEntity("input_boolean.input_boolean1", "on"),
  ],
};

const basicInformation: BridgeBasicInformation = {
  productId: 1,
  productLabel: "Test Label",
  productName: "Test Name",
  vendorId: 2,
  vendorName: "Test Vendor",
  softwareVersion: 3,
  hardwareVersion: 4,
};

const mockedActions: HomeAssistantActions = {
  callAction: vi.fn(),
};

describe("createDevice", () => {
  it("should not use any unknown clusterId", () => {
    const entities = Object.values(testEntities).flat();
    const devices = entities.map(([registry, entity]) =>
      createDevice(mockedActions, basicInformation, registry, entity),
    );
    const actual = _.uniq(
      devices
        .filter((d): d is MatterDevice => d != null)
        .map((d) => deviceToJson(d))
        .flatMap((d) => Object.keys(d.state)),
    ).sort();
    const expected = Object.keys(ClusterId).sort();
    expect(actual).toEqual(expected);
  });
});

function createEntity<T extends {} = {}>(
  entityId: string,
  state: string,
  attributes?: T,
): [HomeAssistantEntityRegistry, HomeAssistantEntityState] {
  const registry = {
    categories: {},
    entity_id: entityId,
    has_entity_name: false,
    id: entityId,
    original_name: entityId,
    platform: "test",
    unique_id: entityId,
  };
  const entity = {
    entity_id: entityId,
    state,
    context: { id: "context" },
    last_changed: "any-change",
    last_updated: "any-update",
    attributes: attributes ?? {},
  };
  return [registry, entity];
}
