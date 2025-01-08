import { describe, expect, it } from "vitest";
import { testMatcher } from "./matches-entity-filter.js";
import {
  HomeAssistantEntityInformation,
  HomeAssistantEntityRegistry,
  HomeAssistantEntityState,
  HomeAssistantMatcherType,
  HomeAssistantDeviceRegistry,
} from "@home-assistant-matter-hub/common";

const registry: HomeAssistantEntityRegistry = {
  id: "id",
  entity_id: "light.my_entity",
  categories: {},
  has_entity_name: true,
  original_name: "any",
  unique_id: "unique_id",
  entity_category: "diagnostic",
  platform: "hue",
  labels: ["test_label"],
};

const registryWithArea = { ...registry, area_id: "area_id" };

const state: HomeAssistantEntityState = {
  entity_id: "light.my_entity",
  state: "on",
  context: { id: "context" },
  last_changed: "any-change",
  last_updated: "any-update",
  attributes: {},
};

const deviceRegistry: HomeAssistantDeviceRegistry = {
  area_id: "area_id",
};

const entity: HomeAssistantEntityInformation = {
  entity_id: "light.my_entity",
  registry,
  state,
};

const entityWithArea = { ...entity, registry: registryWithArea };

const entityWithDevice = { ...entity, deviceRegistry };

describe("matchEntityFilter.testMatcher", () => {
  it("should match the domain", () => {
    expect(
      testMatcher(entity, {
        type: HomeAssistantMatcherType.Domain,
        value: "light",
      }),
    ).toBeTruthy();
  });
  it("should not match the domain", () => {
    expect(
      testMatcher(entity, {
        type: HomeAssistantMatcherType.Domain,
        value: "switch",
      }),
    ).toBeFalsy();
  });

  it("should match the label", () => {
    expect(
      testMatcher(entity, {
        type: HomeAssistantMatcherType.Label,
        value: "test_label",
      }),
    ).toBeTruthy();
  });
  it("should not match the label", () => {
    expect(
      testMatcher(entity, {
        type: HomeAssistantMatcherType.Label,
        value: "other_label",
      }),
    ).toBeFalsy();
  });

  it("should match the platform", () => {
    expect(
      testMatcher(entity, {
        type: HomeAssistantMatcherType.Platform,
        value: "hue",
      }),
    ).toBeTruthy();
  });
  it("should not match the platform", () => {
    expect(
      testMatcher(entity, {
        type: HomeAssistantMatcherType.Platform,
        value: "not_hue",
      }),
    ).toBeFalsy();
  });

  it("should match the area", () => {
    expect(
      testMatcher(entityWithArea, {
        type: HomeAssistantMatcherType.Area,
        value: "area_id",
      }),
    ).toBeTruthy();
  });
  it("should not match the area", () => {
    expect(
      testMatcher(entityWithArea, {
        type: HomeAssistantMatcherType.Area,
        value: "another_area_id",
      }),
    ).toBeFalsy();
  });
  it("should match the device area when entity has no area", () => {
    expect(
      testMatcher(entityWithDevice, {
        type: HomeAssistantMatcherType.Area,
        value: "area_id",
      }),
    ).toBeTruthy();
  });
  it("should not match the device area when entity has no area", () => {
    expect(
      testMatcher(entityWithDevice, {
        type: HomeAssistantMatcherType.Area,
        value: "another_area_id",
      }),
    ).toBeFalsy();
  });
  it("should match when entity and device are in different areas", () => {
    expect(
      testMatcher(entityWithArea, {
        type: HomeAssistantMatcherType.Area,
        value: "area_id",
      }),
    ).toBeTruthy();
  });
  it("should not match when entity and device are in different areas", () => {
    expect(
      testMatcher(entityWithArea, {
        type: HomeAssistantMatcherType.Area,
        value: "another_area_id",
      }),
    ).toBeFalsy();
  });
  it("should match the entity category", () => {
    expect(
      testMatcher(entity, {
        type: HomeAssistantMatcherType.EntityCategory,
        value: "diagnostic",
      }),
    ).toBeTruthy();
  });
  it("should not match the entity category", () => {
    expect(
      testMatcher(entity, {
        type: HomeAssistantMatcherType.EntityCategory,
        value: "configuration",
      }),
    ).toBeFalsy();
  });

  it("should match the pattern", () => {
    expect(
      testMatcher(entity, {
        type: HomeAssistantMatcherType.Pattern,
        value: "light.my_en*t*",
      }),
    ).toBeTruthy();
  });
  it("should not match the pattern", () => {
    expect(
      testMatcher(entity, {
        type: HomeAssistantMatcherType.Pattern,
        value: "light.my_en*z*",
      }),
    ).toBeFalsy();
  });
});
