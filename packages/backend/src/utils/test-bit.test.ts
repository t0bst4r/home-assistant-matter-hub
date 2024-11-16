import { describe, expect, it } from "vitest";

describe("testBit", () => {
  it.each([
    [255, [1, 2, 4, 8, 16, 32, 64, 128]],
    [173, [1, 4, 8, 32, 128]],
    [82, [2, 16, 64]],
  ])("should validate bits: %s", (value, bits) => {
    const actual: number[] = [];
    for (let i = 1; i <= largestBit(value); i *= 2) {
      const isSet = !!(value & i);
      if (isSet) {
        actual.push(i);
      }
    }
    expect(actual).toEqual(bits);
    expect(bits.reduce((a, b) => a + b)).toEqual(value);
  });
});

function largestBit(value: number): number {
  let bit = 1;
  while (bit < value) {
    bit *= 2;
  }
  return bit / 2;
}
