import { describe, expect, it } from "vitest";
import {
  BinarySensorDeviceAttributes,
  BinarySensorDeviceClass,
  BridgeFeatureFlags,
  ClimateDeviceAttributes,
  ClimateHvacAction,
  ClimateHvacMode,
  ClusterId,
  CoverDeviceAttributes,
  FanDeviceAttributes,
  HomeAssistantDomain,
  HomeAssistantEntityInformation,
  HomeAssistantEntityRegistry,
  HomeAssistantEntityState,
  HumidiferDeviceAttributes,
  LightDeviceAttributes,
  LightDeviceColorMode,
  SensorDeviceAttributes,
  SensorDeviceClass,
  MediaPlayerDeviceFeature,
} from "@home-assistant-matter-hub/common";
import { createDevice } from "./create-device.js";
import _ from "lodash";
import { Endpoint, EndpointType } from "@matter/main";

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

const featureFlags: BridgeFeatureFlags = {
  matterSpeakers: true,
  matterFans: true,
};

describe("createDevice", () => {
  it("should not use any unknown clusterId", () => {
    const entities = Object.values(testEntities).flat();
    const devices = entities.map((entity) =>
      createDevice("lock_" + entity.entity_id, entity, featureFlags),
    );
    const actual = _.uniq(
      devices
        .filter((d): d is EndpointType => d != null)
        .map((endpointType) => new Endpoint(endpointType))
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
): HomeAssistantEntityInformation {
  const registry: HomeAssistantEntityRegistry = {
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
