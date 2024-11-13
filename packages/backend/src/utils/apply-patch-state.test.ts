import { beforeEach, describe, expect, it } from "vitest";
import { applyPatchState } from "./apply-patch-state.js";

interface MyState {
  health: number;
  name: string;
  weapons: string[];
  additionalAttributes: {
    height: number;
    weight: number;
    armor: string[];
  };
}

describe("applyPatchState", () => {
  let state: MyState;
  beforeEach(() => {
    state = {
      health: 95,
      name: "awesome knight",
      weapons: ["axe", "sword"],
      additionalAttributes: {
        height: 180,
        weight: 80,
        armor: ["shield", "helmet"],
      },
    };
  });

  it("should only not patch unchanged properties", () => {
    const actualPatch = applyPatchState(state, {
      health: 95,
      name: "awesome knight",
      weapons: ["axe", "sword"],
      additionalAttributes: {
        height: 180,
        weight: 80,
        armor: ["shield", "helmet"],
      },
    });
    expect(actualPatch).toEqual({});
    expect(state).toEqual({
      health: 95,
      name: "awesome knight",
      weapons: ["axe", "sword"],
      additionalAttributes: {
        height: 180,
        weight: 80,
        armor: ["shield", "helmet"],
      },
    });
  });

  it("should patch changed properties", () => {
    const actualPatch = applyPatchState(state, {
      health: 90,
      name: "ultra knight",
      weapons: ["bow", "axe"],
      additionalAttributes: {
        height: 177,
        weight: 79,
        armor: ["metal helmet"],
      },
    });
    expect(actualPatch).toEqual({
      health: 90,
      name: "ultra knight",
      weapons: ["bow", "axe"],
      additionalAttributes: {
        height: 177,
        weight: 79,
        armor: ["metal helmet"],
      },
    });
    expect(state).toEqual({
      health: 90,
      name: "ultra knight",
      weapons: ["bow", "axe"],
      additionalAttributes: {
        height: 177,
        weight: 79,
        armor: ["metal helmet"],
      },
    });
  });

  it("should patch a state partially", () => {
    const actualPatch = applyPatchState(state, {
      name: "awesome knight",
      weapons: ["bow", "axe"],
      additionalAttributes: {
        height: 177,
        weight: 79,
        armor: ["metal helmet"],
      },
    });
    expect(actualPatch).toEqual({
      weapons: ["bow", "axe"],
      additionalAttributes: {
        height: 177,
        weight: 79,
        armor: ["metal helmet"],
      },
    });
    expect(state).toEqual({
      health: 95,
      name: "awesome knight",
      weapons: ["bow", "axe"],
      additionalAttributes: {
        height: 177,
        weight: 79,
        armor: ["metal helmet"],
      },
    });
  });
});
