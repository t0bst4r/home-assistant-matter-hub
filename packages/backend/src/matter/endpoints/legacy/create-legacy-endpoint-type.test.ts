import {
  type BinarySensorDeviceAttributes,
  BinarySensorDeviceClass,
  type ClimateDeviceAttributes,
  ClimateHvacAction,
  ClimateHvacMode,
  ClusterId,
  type CoverDeviceAttributes,
  type FanDeviceAttributes,
  HomeAssistantDomain,
  type HomeAssistantEntityInformation,
  type HomeAssistantEntityRegistry,
  type HomeAssistantEntityState,
  type HumidiferDeviceAttributes,
  type LightDeviceAttributes,
  LightDeviceColorMode,
  MediaPlayerDeviceFeature,
  type SensorDeviceAttributes,
  SensorDeviceClass,
  type VacuumDeviceAttributes,
} from "@home-assistant-matter-hub/common";
import { Endpoint, type EndpointType } from "@matter/main";
import { uniq } from "lodash-es";
import { describe, expect, it } from "vitest";
import { createLegacyEndpointType } from "./create-legacy-endpoint-type.js";

const testEntities: Record<
  HomeAssistantDomain,
  HomeAssistantEntityInformation[]
> = {
  [HomeAssistantDomain.binary_sensor]: Object.values(
    BinarySensorDeviceClass,
  ).map((device_class, idx) =>
    createEntity<BinarySensorDeviceAttributes>(
      `binary_sensor.bs${idx + 1}`,
      "on",
      {
        device_class: device_class,
      },
    ),
  ),
  [HomeAssistantDomain.vacuum]: [
    createEntity<VacuumDeviceAttributes>("vacuum.vac1", "cleaning", {
      supported_features: 15, // Simulating support for various vacuum features
      battery_level: 75,
      fan_speed: "medium",
      fan_speed_list: ["off", "low", "medium", "high"],
    }),
  ],
  [HomeAssistantDomain.climate]: [
    createEntity<ClimateDeviceAttributes>("climate.cl1", "on", {
      hvac_modes: [ClimateHvacMode.heat],
      hvac_mode: ClimateHvacMode.off,
      hvac_action: ClimateHvacAction.off,
    }),
    createEntity<ClimateDeviceAttributes>("climate.cl2", "on", {
      hvac_modes: [ClimateHvacMode.cool],
      hvac_mode: ClimateHvacMode.off,
      hvac_action: ClimateHvacAction.off,
    }),
    createEntity<ClimateDeviceAttributes>("climate.cl3", "on", {
      hvac_modes: [ClimateHvacMode.heat_cool],
      hvac_mode: ClimateHvacMode.off,
      hvac_action: ClimateHvacAction.off,
    }),
    createEntity<ClimateDeviceAttributes>("climate.cl4", "on", {
      hvac_modes: [ClimateHvacMode.heat, ClimateHvacMode.cool],
      hvac_mode: ClimateHvacMode.off,
      hvac_action: ClimateHvacAction.off,
    }),
  ],
  [HomeAssistantDomain.cover]: [
    createEntity<CoverDeviceAttributes>("cover.co1", "on", {
      supported_features: 15,
    }),
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
    createEntity<SensorDeviceAttributes>("sensor.s3", "on", {
      device_class: SensorDeviceClass.illuminance,
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
  [HomeAssistantDomain.input_button]: [createEntity("input_button.ib1", "any")],
  [HomeAssistantDomain.button]: [createEntity("button.b1", "any")],
  [HomeAssistantDomain.media_player]: [
    createEntity("media_player.m1", "on", {
      supported_features: MediaPlayerDeviceFeature.SELECT_SOURCE,
    }),
  ],
  [HomeAssistantDomain.humidifier]: [
    createEntity<HumidiferDeviceAttributes>("humidifier.h1", "on", {
      min_humidity: 15,
      max_humidity: 80,
      humidity: 60,
      current_humidity: 45,
    }),
  ],
};

describe("createLegacyEndpointType", () => {
  it("should not use any unknown clusterId", () => {
    const entities = Object.values(testEntities).flat();
    const devices = entities.map((entity) => createLegacyEndpointType(entity));
    const endpoints = devices
      .filter((d): d is EndpointType => d != null)
      .map((endpointType) => new Endpoint(endpointType));
    const actual = uniq(endpoints.flatMap((d) => Object.keys(d.state)))
      .filter((key) => !/^\d+$/.test(key))
      .sort();
    const expected = Object.keys(ClusterId).sort();
    expect(actual).toEqual(expected);
  });
});

function createEntity<T extends {} = {}>(
  entityId: string,
  state: string,
  attributes?: T,
): HomeAssistantEntityInformation {
  const registry: HomeAssistantEntityRegistry = {
    device_id: `${entityId}_device`,
    categories: {},
    entity_id: entityId,
    has_entity_name: false,
    id: entityId,
    original_name: entityId,
    platform: "test",
    unique_id: entityId,
  };
  const entityState: HomeAssistantEntityState = {
    entity_id: entityId,
    state,
    context: { id: "context" },
    last_changed: "any-change",
    last_updated: "any-update",
    attributes: attributes ?? {},
  };
  return { entity_id: entityId, registry, state: entityState };
}
