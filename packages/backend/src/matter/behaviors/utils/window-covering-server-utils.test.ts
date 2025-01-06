import { describe, expect, it } from "vitest";
import { convertCoverValue } from "./window-covering-server-utils.js";

describe("convertCoverValue", () => {
  it("should return the percentage", () => {
    expect(convertCoverValue(10, false, false)).toEqual(10);
    expect(convertCoverValue(25, false, false)).toEqual(25);
    expect(convertCoverValue(0, false, false)).toEqual(0);
    expect(convertCoverValue(100, false, false)).toEqual(100);
  });

  it("should invert percentage", () => {
    expect(convertCoverValue(10, true, false)).toEqual(90);
    expect(convertCoverValue(25, true, false)).toEqual(75);
    expect(convertCoverValue(0, true, false)).toEqual(100);
    expect(convertCoverValue(100, true, false)).toEqual(0);
  });

  it("should swap open and close percentage", () => {
    expect(convertCoverValue(10, false, true)).toEqual(10);
    expect(convertCoverValue(25, false, true)).toEqual(25);
    expect(convertCoverValue(0, false, true)).toEqual(100);
    expect(convertCoverValue(100, false, true)).toEqual(0);
  });

  it("should invert and swap open and close percentage", () => {
    expect(convertCoverValue(10, true, true)).toEqual(90);
    expect(convertCoverValue(25, true, true)).toEqual(75);
    expect(convertCoverValue(0, true, true)).toEqual(0);
    expect(convertCoverValue(100, true, true)).toEqual(100);
  });
});
