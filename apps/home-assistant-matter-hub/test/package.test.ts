import { describe, expect, it } from "vitest";
import own from "../package.json";
import backend from "@home-assistant-matter-hub/backend/package.json";
import common from "@home-assistant-matter-hub/common/package.json";
import _ from "lodash";

describe("home-assistant-matter-hub", () => {
  it("should include all necessary dependencies", () => {
    const expected = _.pickBy(
      { ...backend.dependencies, ...common.dependencies },
      (_, key) => !key.startsWith("@home-assistant-matter-hub/"),
    );
    expect(own.dependencies).toEqual(expected);
  });

  it.skip("should pin all dependencies", () => {
    const expected = _.mapValues(own.dependencies, (value) =>
      value.replace(/^\D+/, ""),
    );
    expect(own.dependencies).toEqual(expected);
  });
});
