import backend from "@home-assistant-matter-hub/backend/package.json" with {
  type: "json",
};
import common from "@home-assistant-matter-hub/common/package.json" with {
  type: "json",
};
import { mapValues, pickBy } from "lodash-es";
import { describe, expect, it } from "vitest";
import own from "../package.json" with { type: "json" };

describe("home-assistant-matter-hub", () => {
  it("should include all necessary dependencies", () => {
    const expected = pickBy(
      { ...backend.dependencies, ...common.dependencies },
      (_, key) => !key.startsWith("@home-assistant-matter-hub/"),
    );
    expect(own.dependencies).toEqual(expected);
  });

  it("should pin all dependencies", () => {
    const expected = mapValues(own.dependencies, (value) =>
      value.replace(/^\D+/, ""),
    );
    expect(own.dependencies).toEqual(expected);
  });
});
