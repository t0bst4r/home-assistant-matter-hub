import { describe, expect, it } from "vitest";
import { testMatcher } from "./match-entity-filter.js";
import {
  HomeAssistantEntityRegistryWithInitialState,
  HomeAssistantEntityState,
  HomeAssistantMatcherType,
} from "@home-assistant-matter-hub/common";

const entity: HomeAssistantEntityRegistryWithInitialState = {
  id: "id",
  entity_id: "light.my_entity",
  categories: {},
  has_entity_name: true,
  original_name: "any",
  unique_id: "unique_id",
  platform: "hue",
  labels: ["test_label"],
  initialState: undefined as unknown as HomeAssistantEntityState,
};

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
